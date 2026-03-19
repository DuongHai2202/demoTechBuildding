package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.contract.BoqItemRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.BoqItemResponseDTO;

import java.util.List;

public interface BoqItemService {
    BoqItemResponseDTO createBoqItem(BoqItemRequestDTO request);
    List<BoqItemResponseDTO> getBoqItemsByContract(Integer contractId);
    void deleteBoqItem(Integer id);
}
