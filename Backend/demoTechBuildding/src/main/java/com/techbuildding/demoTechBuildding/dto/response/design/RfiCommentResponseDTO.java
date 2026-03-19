package com.techbuildding.demoTechBuildding.dto.response.design;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfiCommentResponseDTO {
    private Integer id;
    private Integer rfiId;
    private String content;
    private Long userId;
    private String userName;
    private String userAvatar;
    private LocalDateTime createdAt;
}
