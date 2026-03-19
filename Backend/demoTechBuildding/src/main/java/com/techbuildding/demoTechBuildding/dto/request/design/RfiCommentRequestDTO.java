package com.techbuildding.demoTechBuildding.dto.request.design;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfiCommentRequestDTO {
    private Integer rfiId;
    private String content;
    private Long userId;
}
