package org.venusgiti.mapper;

import org.springframework.stereotype.Component;
import org.venusgiti.util.RevenueCategory;

@Component
public class SmileTransactionCategoryMapper {

    public RevenueCategory map(int transactionCode) {

        if (transactionCode == 400) {
            return RevenueCategory.ROOM;
        }

        if (transactionCode >= 510 && transactionCode <= 590) {
            return RevenueCategory.FOOD_BEVERAGE;
        }

        if (transactionCode < 100) {
            return RevenueCategory.PAYMENT;
        }

        return RevenueCategory.OTHER;
    }
}