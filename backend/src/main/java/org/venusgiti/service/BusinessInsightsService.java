package org.venusgiti.service;

import org.springframework.stereotype.Service;
import org.venusgiti.dto.*;
import org.venusgiti.repository.SmileBusinessInsightsRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BusinessInsightsService {
    private final SmileBusinessInsightsRepository repository;

    public BusinessInsightsService(SmileBusinessInsightsRepository repository) {
        this.repository = repository;
    }

    public CustomerDemographicsResponse getCustomerDemographics(LocalDate businessDate) {
        var ageRows=repository.getAgeGroups(businessDate);
        var genderRows=repository.getGenderGroups(businessDate);
        var nationalityRows=repository.getNationalityGroups(businessDate);
        int totalGuests=ageRows.stream().mapToInt(SmileBusinessInsightsRepository.AgeGroupRow::guests).sum();
        int unknownAge=ageRows.stream().filter(r->"UNKNOWN".equals(r.ageGroup())).mapToInt(SmileBusinessInsightsRepository.AgeGroupRow::guests).sum();
        int knownAge=totalGuests-unknownAge;
        var ageGroups=ageRows.stream().map(r->new CustomerDemographicsResponse.AgeGroup(r.ageGroup(),r.guests(),percent(r.guests(),totalGuests))).toList();
        var gender=genderRows.stream().map(r->new CustomerDemographicsResponse.GenderGroup(r.gender(),r.guests(),percent(r.guests(),totalGuests))).toList();
        var nationalities=nationalityRows.stream().map(r->new CustomerDemographicsResponse.NationalityGroup(r.nationality(),r.guests(),percent(r.guests(),totalGuests))).toList();
        var coverage=new CustomerDemographicsResponse.DemographicCoverage(knownAge,unknownAge,percent(knownAge,totalGuests));
        return new CustomerDemographicsResponse(businessDate,totalGuests,coverage,ageGroups,gender,nationalities);
    }

    private double percent(int value,int total) {
        if(total<=0)return 0.0;
        return BigDecimal.valueOf(value).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(total),2,RoundingMode.HALF_UP).doubleValue();
    }

    public CustomerMixResponse getCustomerMix(LocalDate businessDate) {
        var onsenRow=repository.getHotelToOnsenMix(businessDate);
        int hotelGuests=onsenRow.hotelGuests();
        int onsenUsed=onsenRow.usedGuests();
        var onsen=new CustomerMixResponse.ServiceUsage(true,onsenUsed,Math.max(0,hotelGuests-onsenUsed),percent(onsenUsed,hotelGuests));
        var breakfastRow=repository.getHotelToBreakfastMix(businessDate);
        CustomerMixResponse.BreakfastUsage breakfast;
        if(breakfastRow.sourceGuests()<=0){
            breakfast=new CustomerMixResponse.BreakfastUsage(false,null,null,null,null);
        }else{
            int eligible=breakfastRow.eligibleGuests();
            int used=breakfastRow.usedGuests();
            breakfast=new CustomerMixResponse.BreakfastUsage(true,eligible,used,Math.max(0,eligible-used),percent(used,eligible));
        }
        return new CustomerMixResponse(businessDate,hotelGuests,onsen,breakfast);
    }

    public RevenueMixResponse getRevenueMix(LocalDate businessDate) {
        var rows=repository.getRevenueMix(businessDate);
        Map<String,BigDecimal> byUnit=rows.stream().collect(Collectors.toMap(SmileBusinessInsightsRepository.RevenueMixRow::businessUnit,r->r.revenue()!=null?r.revenue():BigDecimal.ZERO,BigDecimal::add));
        List<String> units=List.of("HOTEL","F&B","ONSEN","SPA","OTHER");
        BigDecimal total=units.stream().map(u->byUnit.getOrDefault(u,BigDecimal.ZERO)).reduce(BigDecimal.ZERO,BigDecimal::add);
        var result=new ArrayList<RevenueMixResponse.BusinessUnitRevenue>();
        for(String unit:units){
            BigDecimal revenue=byUnit.getOrDefault(unit,BigDecimal.ZERO);
            double contribution=total.compareTo(BigDecimal.ZERO)==0?0.0:revenue.multiply(BigDecimal.valueOf(100)).divide(total,2,RoundingMode.HALF_UP).doubleValue();
            result.add(new RevenueMixResponse.BusinessUnitRevenue(unit,revenue,contribution));
        }
        return new RevenueMixResponse(businessDate,total,result);
    }

    public RevenueTrendResponse getRevenueTrend(LocalDate toDate,int days) {
        validateDays(days);
        LocalDate fromDate=toDate.minusDays(days-1L);
        var rows=repository.getRevenueTrend(fromDate,toDate);
        Map<LocalDate,BigDecimal> byDate=rows.stream().collect(Collectors.toMap(SmileBusinessInsightsRepository.RevenueTrendRow::date,r->r.revenue()!=null?r.revenue():BigDecimal.ZERO,BigDecimal::add));
        var data=new ArrayList<RevenueTrendResponse.RevenuePoint>();
        for(LocalDate d=fromDate;!d.isAfter(toDate);d=d.plusDays(1)) data.add(new RevenueTrendResponse.RevenuePoint(d,byDate.getOrDefault(d,BigDecimal.ZERO)));
        return new RevenueTrendResponse(fromDate,toDate,data);
    }

    public CustomerTrendResponse getCustomerTrend(LocalDate toDate,int days) {
        validateDays(days);
        LocalDate fromDate=toDate.minusDays(days-1L);
        var data=repository.getCustomerTrend(fromDate,toDate).stream()
                .map(r->new CustomerTrendResponse.CustomerPoint(r.date(),r.adults(),r.children(),r.unknownAge()))
                .toList();
        return new CustomerTrendResponse(fromDate,toDate,data);
    }

    public RevenueUnitTrendResponse getRevenueUnitTrend(LocalDate toDate,int days) {
        validateDays(days);
        LocalDate fromDate=toDate.minusDays(days-1L);
        var rows=repository.getRevenueUnitTrend(fromDate,toDate);
        Map<LocalDate,Map<String,BigDecimal>> byDate=rows.stream().collect(Collectors.groupingBy(
                SmileBusinessInsightsRepository.RevenueUnitTrendRow::date,
                Collectors.toMap(SmileBusinessInsightsRepository.RevenueUnitTrendRow::businessUnit,r->r.revenue()!=null?r.revenue():BigDecimal.ZERO,BigDecimal::add)
        ));
        var data=new ArrayList<RevenueUnitTrendResponse.RevenueUnitPoint>();
        for(LocalDate d=fromDate;!d.isAfter(toDate);d=d.plusDays(1)){
            Map<String,BigDecimal> u=byDate.getOrDefault(d,Map.of());
            data.add(new RevenueUnitTrendResponse.RevenueUnitPoint(d,u.getOrDefault("HOTEL",BigDecimal.ZERO),u.getOrDefault("F&B",BigDecimal.ZERO),u.getOrDefault("ONSEN",BigDecimal.ZERO),u.getOrDefault("SPA",BigDecimal.ZERO),u.getOrDefault("OTHER",BigDecimal.ZERO)));
        }
        return new RevenueUnitTrendResponse(fromDate,toDate,data);
    }

    private void validateDays(int days){
        if(days<1||days>90) throw new IllegalArgumentException("days must be between 1 and 90");
    }
}
