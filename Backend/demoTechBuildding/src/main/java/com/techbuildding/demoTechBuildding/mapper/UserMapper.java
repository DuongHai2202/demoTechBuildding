package com.techbuildding.demoTechBuildding.mapper;

import com.techbuildding.demoTechBuildding.dto.request.user.UserRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.entity.UserHasRole;
import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * MapStruct mapper for converting between User entity and DTOs.
 * Uses setter-based mapping (disableBuilder) because Lombok Builder
 * does not include fields from the parent class (AbstractEntity).
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    // ===== Request DTO → Entity =====
    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "userHasRoles", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "deviceId", ignore = true)
    @Mapping(target = "partner", ignore = true)
    User toEntity(UserRequestDTO dto);

    // ===== Entity → Response DTO =====
    @Mapping(target = "roles", source = "userHasRoles", qualifiedByName = "mapRoles")
    @Mapping(target = "partnerId", source = "partner.id")
    @Mapping(target = "partnerName", source = "partner.name")
    @Mapping(target = "hasFaceRegistered", expression = "java(user.getFaceDescriptor() != null && !user.getFaceDescriptor().isEmpty())")
    UserResponseDTO toResponseDTO(User user);

    // ===== List<Entity> → List<Response DTO> =====
    List<UserResponseDTO> toResponseDTOList(List<User> users);

    // ===== Custom mapping: Set<UserHasRole> → List<String> =====
    @Named("mapRoles")
    default List<String> mapRoles(Set<UserHasRole> userHasRoles) {
        if (userHasRoles == null)
            return List.of();
        return userHasRoles.stream()
                .map(uhr -> uhr.getRole().getName())
                .collect(Collectors.toList());
    }
}
