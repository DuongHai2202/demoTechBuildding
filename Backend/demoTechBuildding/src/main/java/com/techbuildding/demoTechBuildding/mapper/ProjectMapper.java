package com.techbuildding.demoTechBuildding.mapper;

import com.techbuildding.demoTechBuildding.dto.request.project.ProjectRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectMemberResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.ProjectMember;
import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct mapper for Project and ProjectMember entities.
 */
@Mapper(componentModel = "spring")
public interface ProjectMapper {

    // ===== Request DTO → Entity =====
    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Project toEntity(ProjectRequestDTO dto);

    // ===== Entity → Response DTO =====
    ProjectResponseDTO toResponseDTO(Project project);

    List<ProjectResponseDTO> toResponseDTOList(List<Project> projects);

    // ===== ProjectMember → Response DTO =====
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    ProjectMemberResponseDTO toMemberResponseDTO(ProjectMember member);

    List<ProjectMemberResponseDTO> toMemberResponseDTOList(List<ProjectMember> members);
}
