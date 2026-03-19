package com.techbuildding.demoTechBuildding.mapper;

import com.techbuildding.demoTechBuildding.dto.request.contract.ContractRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Contract;
import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContractMapper {
    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parentContract", ignore = true)
    Contract toEntity(ContractRequestDTO dto);

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    @Mapping(target = "partnerId", source = "partner.id")
    @Mapping(target = "parentId", source = "parentContract.id")
    @Mapping(target = "fileUrl", ignore = true)
    ContractResponseDTO toResponseDTO(Contract entity);

    List<ContractResponseDTO> toResponseDTOList(List<Contract> entities);
}
