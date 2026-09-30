package com.techbuildding.demoTechBuildding.dto.response.contract;

import lombok.Builder;
import lombok.Getter;

/**
 * Authenticated contract document payload returned by the service layer.
 */
@Getter
@Builder
public class ContractFileDownload {
    private byte[] content;
    private String fileName;
    private String contentType;
}
