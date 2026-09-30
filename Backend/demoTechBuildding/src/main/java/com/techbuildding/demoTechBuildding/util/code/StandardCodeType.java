package com.techbuildding.demoTechBuildding.util.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * The shared business-code catalogue used by all modules.
 *
 * The generated value has the form PREFIX-YEAR-SEQUENCE, for example
 * {@code DA-2026-0001}. A caller may still provide and later edit a custom
 * code; this catalogue is only the default generation policy.
 */
@Getter
@RequiredArgsConstructor
public enum StandardCodeType {
    PROJECT("PROJECT", "DA"),
    PARTNER("PARTNER", "DT"),
    CONTRACT("CONTRACT", "HD"),
    BIDDING_PACKAGE("BIDDING_PACKAGE", "GTH"),
    MATERIAL("MATERIAL", "VT"),
    ZONE("ZONE", "KV"),
    DRAWING("DRAWING", "BV"),
    DESIGN_SHEET("DESIGN_SHEET", "BVT"),
    BOQ_ITEM("BOQ_ITEM", "BOQ"),
    TECHNICAL_STANDARD("TECHNICAL_STANDARD", "TC");

    private final String key;
    private final String prefix;
}
