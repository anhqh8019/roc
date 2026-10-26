package org.venusgiti.repository;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Repository
public class SmileMonthlyReportRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public SmileMonthlyReportRepository(@Qualifier("smileJdbcTemplate") NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<MonthlyReportRow> getMonthlyReport(int year, int toMonth) {
        String sql = """
            WITH Months AS (
                SELECT 1 AS MonthNo
                UNION ALL SELECT MonthNo + 1 FROM Months WHERE MonthNo < :toMonth
            ),
            RoomTransactions AS (
                SELECT MONTH(ft.TransactionDate) MonthNo, ft.FolioNum, ft.TransactionAmount,
                       f.RoomCode, f.RoomTypeCode, f.GroupCode, f.ConfirmNum,
                       CASE WHEN f.RoomTypeCode IN ('VA','VL','VO') THEN 'VILLA'
                            WHEN f.RoomTypeCode IN ('DHK','DHT','DLK','DLT','PRK','PRT','SUI') THEN 'HOTEL'
                            WHEN f.RoomCode BETWEEN '9900' AND '9912' THEN 'MASTER'
                            ELSE 'OTHER' END FolioRoomGroup
                FROM SMILE_FO.dbo.FolioTransaction ft
                JOIN SMILE_FO.dbo.TransactionCode tc
                  ON tc.TransactionCode=ft.TransactionCode AND tc.TransactionSubCode=ft.TransactionSubCode
                JOIN SMILE_FO.dbo.Folio f ON f.FolioNum=ft.FolioNum
                WHERE ft.TransactionDate >= DATEFROMPARTS(:year,1,1)
                  AND ft.TransactionDate < DATEADD(day,1,EOMONTH(DATEFROMPARTS(:year,:toMonth,1)))
                  AND tc.TransactionGroup=1 AND tc.DeptCode=120 AND ISNULL(ft.VoidTransactionFlag,0)=0
            ),
            DirectRoomRevenue AS (
                SELECT MonthNo,
                       SUM(CASE WHEN FolioRoomGroup='VILLA' THEN TransactionAmount ELSE 0 END) VillaRevenue,
                       SUM(CASE WHEN FolioRoomGroup='HOTEL' THEN TransactionAmount ELSE 0 END) HotelRevenue,
                       SUM(CASE WHEN FolioRoomGroup='OTHER' THEN TransactionAmount ELSE 0 END) OtherRevenue
                FROM RoomTransactions WHERE FolioRoomGroup<>'MASTER' GROUP BY MonthNo
            ),
            MasterRevenue AS (
                SELECT MonthNo,FolioNum,MAX(RoomCode) MasterRoom,MAX(GroupCode) GroupCode,
                       MAX(ConfirmNum) ConfirmNum,SUM(TransactionAmount) Revenue
                FROM RoomTransactions WHERE FolioRoomGroup='MASTER' GROUP BY MonthNo,FolioNum
            ),
            MasterChildRaw AS (
                SELECT DISTINCT mr.MonthNo,mr.FolioNum MasterFolioNum,mr.Revenue,
                       child.FolioNum ChildFolioNum,
                       CASE WHEN child.RoomTypeCode IN ('VA','VL','VO') THEN 'VILLA'
                            WHEN child.RoomTypeCode IN ('DHK','DHT','DLK','DLT','PRK','PRT','SUI') THEN 'HOTEL'
                            ELSE 'OTHER' END ChildRoomGroup
                FROM MasterRevenue mr
                LEFT JOIN SMILE_FO.dbo.Folio child
                  ON child.FolioNum<>mr.FolioNum
                 AND child.RoomCode NOT BETWEEN '9900' AND '9912'
                 AND ((NULLIF(LTRIM(RTRIM(mr.GroupCode)),'') IS NOT NULL
                       AND NULLIF(LTRIM(RTRIM(child.GroupCode)),'') IS NOT NULL
                       AND child.GroupCode=mr.GroupCode)
                      OR (mr.ConfirmNum IS NOT NULL AND child.ConfirmNum=mr.ConfirmNum))
            ),
            MasterClassification AS (
                SELECT MonthNo,MasterFolioNum,MAX(Revenue) Revenue,
                       MAX(CASE WHEN ChildRoomGroup='HOTEL' THEN 1 ELSE 0 END) HasHotel,
                       MAX(CASE WHEN ChildRoomGroup='VILLA' THEN 1 ELSE 0 END) HasVilla
                FROM MasterChildRaw GROUP BY MonthNo,MasterFolioNum
            ),
            MasterTyped AS (
                SELECT *,CASE WHEN HasHotel=1 AND HasVilla=0 THEN 'HOTEL_ONLY'
                              WHEN HasHotel=0 AND HasVilla=1 THEN 'VILLA_ONLY'
                              WHEN HasHotel=1 AND HasVilla=1 THEN 'MIXED'
                              ELSE 'UNMAPPED' END MasterType
                FROM MasterClassification
            ),
            MixedRoomNights AS (
                SELECT mc.MonthNo,mc.MasterFolioNum,
                       SUM(CASE WHEN mc.ChildRoomGroup='HOTEL' THEN ISNULL(frn.NumRoom,0) ELSE 0 END) HotelRoomNights,
                       SUM(CASE WHEN mc.ChildRoomGroup='VILLA' THEN ISNULL(frn.NumRoom,0) ELSE 0 END) VillaRoomNights
                FROM (SELECT DISTINCT MonthNo,MasterFolioNum,ChildFolioNum,ChildRoomGroup FROM MasterChildRaw) mc
                JOIN MasterTyped mt ON mt.MonthNo=mc.MonthNo AND mt.MasterFolioNum=mc.MasterFolioNum AND mt.MasterType='MIXED'
                LEFT JOIN SMILE_FO.dbo.FolioRoomNight frn ON frn.FolioNum=mc.ChildFolioNum
                  AND frn.hDate>=DATEFROMPARTS(:year,mc.MonthNo,1)
                  AND frn.hDate<DATEADD(month,1,DATEFROMPARTS(:year,mc.MonthNo,1))
                GROUP BY mc.MonthNo,mc.MasterFolioNum
            ),
            MasterAllocated AS (
                SELECT mt.MonthNo,mt.Revenue,
                       CASE WHEN mt.MasterType='VILLA_ONLY' THEN mt.Revenue
                            WHEN mt.MasterType='MIXED' AND ISNULL(mrn.HotelRoomNights,0)+ISNULL(mrn.VillaRoomNights,0)>0
                            THEN mt.Revenue*ISNULL(mrn.VillaRoomNights,0)/NULLIF(ISNULL(mrn.HotelRoomNights,0)+ISNULL(mrn.VillaRoomNights,0),0)
                            ELSE 0 END VillaRevenue,
                       CASE WHEN mt.MasterType='HOTEL_ONLY' THEN mt.Revenue
                            WHEN mt.MasterType='MIXED' AND ISNULL(mrn.HotelRoomNights,0)+ISNULL(mrn.VillaRoomNights,0)>0
                            THEN mt.Revenue*ISNULL(mrn.HotelRoomNights,0)/NULLIF(ISNULL(mrn.HotelRoomNights,0)+ISNULL(mrn.VillaRoomNights,0),0)
                            ELSE 0 END HotelRevenue,
                       CASE WHEN mt.MasterType='UNMAPPED' THEN mt.Revenue
                            WHEN mt.MasterType='MIXED' AND ISNULL(mrn.HotelRoomNights,0)+ISNULL(mrn.VillaRoomNights,0)=0 THEN mt.Revenue
                            ELSE 0 END UnallocatedRevenue
                FROM MasterTyped mt LEFT JOIN MixedRoomNights mrn
                  ON mrn.MonthNo=mt.MonthNo AND mrn.MasterFolioNum=mt.MasterFolioNum
            ),
            MasterMonthly AS (
                SELECT MonthNo,SUM(VillaRevenue) VillaRevenue,SUM(HotelRevenue) HotelRevenue,
                       SUM(UnallocatedRevenue) UnallocatedRevenue FROM MasterAllocated GROUP BY MonthNo
            ),
            OtherBusinessRevenue AS (
                SELECT MONTH(ft.TransactionDate) MonthNo,
                       SUM(CASE WHEN tc.DeptCode=405 THEN ft.TransactionAmount ELSE 0 END) OnsenRevenue,
                       SUM(CASE WHEN tc.DeptCode IN (210,220,230,250,260,280,290) THEN ft.TransactionAmount ELSE 0 END) RestaurantRevenue
                FROM SMILE_FO.dbo.FolioTransaction ft
                JOIN SMILE_FO.dbo.TransactionCode tc
                  ON tc.TransactionCode=ft.TransactionCode AND tc.TransactionSubCode=ft.TransactionSubCode
                WHERE ft.TransactionDate>=DATEFROMPARTS(:year,1,1)
                  AND ft.TransactionDate<DATEADD(day,1,EOMONTH(DATEFROMPARTS(:year,:toMonth,1)))
                  AND tc.TransactionGroup=1 AND tc.DeptCode IS NOT NULL AND ISNULL(ft.VoidTransactionFlag,0)=0
                GROUP BY MONTH(ft.TransactionDate)
            ),
            SoldRooms AS (
                SELECT MONTH(frn.hDate) MonthNo,
                       SUM(CASE WHEN r.RoomTypeCode IN ('VA','VL','VO') THEN ISNULL(frn.NumRoom,0) ELSE 0 END) VillaSoldRooms,
                       SUM(CASE WHEN r.RoomTypeCode NOT IN ('VA','VL','VO') THEN ISNULL(frn.NumRoom,0) ELSE 0 END) HotelSoldRooms
                FROM SMILE_FO.dbo.FolioRoomNight frn
                JOIN SMILE_FO.dbo.Room r ON r.RoomCode=frn.RoomCode
                JOIN SMILE_FO.dbo.RoomType rt ON rt.RoomTypeCode=r.RoomTypeCode
                WHERE frn.hDate>=DATEFROMPARTS(:year,1,1)
                  AND frn.hDate<DATEADD(day,1,EOMONTH(DATEFROMPARTS(:year,:toMonth,1)))
                  AND rt.NumRoom>0 AND ISNULL(frn.HouseUse,0)=0 AND ISNULL(frn.Comp,0)=0
                  AND ISNULL(frn.OOO,0)=0 AND ISNULL(frn.OOI,0)=0
                GROUP BY MONTH(frn.hDate)
            ),
            RoomRevenueControl AS (
                SELECT MonthNo,SUM(TransactionAmount) TotalRoomRevenue FROM RoomTransactions GROUP BY MonthNo
            )
            SELECT m.MonthNo,
                   CAST(ISNULL(dr.VillaRevenue,0)+ISNULL(mm.VillaRevenue,0) AS decimal(19,2)) VillaRevenue,
                   CAST(ISNULL(dr.HotelRevenue,0)+ISNULL(mm.HotelRevenue,0) AS decimal(19,2)) HotelRevenue,
                   CAST(ISNULL(obr.OnsenRevenue,0) AS decimal(19,2)) OnsenRevenue,
                   CAST(ISNULL(obr.RestaurantRevenue,0) AS decimal(19,2)) RestaurantRevenue,
                   CAST(ISNULL(sr.VillaSoldRooms,0) AS int) VillaSoldRooms,
                   CAST(ISNULL(sr.HotelSoldRooms,0) AS int) HotelSoldRooms,
                   CAST(ISNULL(mm.UnallocatedRevenue,0)+ISNULL(dr.OtherRevenue,0) AS decimal(19,2)) UnallocatedRevenue,
                   CAST(ISNULL(rrc.TotalRoomRevenue,0) AS decimal(19,2)) TotalRoomRevenue,
                   CAST(ISNULL(rrc.TotalRoomRevenue,0)-(
                     ISNULL(dr.VillaRevenue,0)+ISNULL(mm.VillaRevenue,0)+ISNULL(dr.HotelRevenue,0)+ISNULL(mm.HotelRevenue,0)
                     +ISNULL(mm.UnallocatedRevenue,0)+ISNULL(dr.OtherRevenue,0)) AS decimal(19,2)) ReconciliationDifference
            FROM Months m
            LEFT JOIN DirectRoomRevenue dr ON dr.MonthNo=m.MonthNo
            LEFT JOIN MasterMonthly mm ON mm.MonthNo=m.MonthNo
            LEFT JOIN OtherBusinessRevenue obr ON obr.MonthNo=m.MonthNo
            LEFT JOIN SoldRooms sr ON sr.MonthNo=m.MonthNo
            LEFT JOIN RoomRevenueControl rrc ON rrc.MonthNo=m.MonthNo
            ORDER BY m.MonthNo OPTION (MAXRECURSION 100)
            """;

        return jdbc.query(sql, Map.of("year", year, "toMonth", toMonth), (rs, n) -> new MonthlyReportRow(
                rs.getInt("MonthNo"), rs.getBigDecimal("VillaRevenue"), rs.getBigDecimal("HotelRevenue"),
                rs.getBigDecimal("OnsenRevenue"), rs.getBigDecimal("RestaurantRevenue"),
                rs.getInt("VillaSoldRooms"), rs.getInt("HotelSoldRooms"), rs.getBigDecimal("UnallocatedRevenue"),
                rs.getBigDecimal("TotalRoomRevenue"), rs.getBigDecimal("ReconciliationDifference")
        ));
    }

    public record MonthlyReportRow(int month, BigDecimal villaRevenue, BigDecimal hotelRevenue,
                                   BigDecimal onsenRevenue, BigDecimal restaurantRevenue,
                                   int villaRoomsSold, int hotelRoomsSold, BigDecimal unallocatedRoomRevenue,
                                   BigDecimal totalRoomRevenue, BigDecimal reconciliationDifference) {}
}
