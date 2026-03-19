package com.techbuildding.demoTechBuildding.mapper;

import com.techbuildding.demoTechBuildding.dto.request.worklog.WorkLogRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.worklog.WorkLogResponseDTO;
import com.techbuildding.demoTechBuildding.entity.WorkLog;
import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WorkLogMapper {
    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    WorkLog toEntity(WorkLogRequestDTO dto);

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "checkedByName", source = "checkedBy.fullName")
    @Mapping(target = "approvedByName", source = "approvedBy.fullName")
    @Mapping(target = "mediaUrls", ignore = true)
    WorkLogResponseDTO toResponseDTO(WorkLog entity);

    List<WorkLogResponseDTO> toResponseDTOList(List<WorkLog> entities);
}
