package org.venusgiti.mapper;

import org.springframework.stereotype.Component;
import org.venusgiti.util.RevenueCategory;

@Component
public class SmileRevenueCategoryMapper {

    public RevenueCategory map(int code) {
        return switch (code) {
            case 400 -> RevenueCategory.ROOM;

            case 510, 560, 590 ->
                    RevenueCategory.FOOD_BEVERAGE;

            case 655, 666 ->
                    RevenueCategory.ONSEN;

            case 630, 675, 676 ->
                    RevenueCategory.OTHER;

            case 2, 32, 90, 95 ->
                    RevenueCategory.PAYMENT;

            default ->
                    RevenueCategory.UNKNOWN;
        };
    }
}