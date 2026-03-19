package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.contract.BoqItemRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.contract.BoqItemResponseDTO;
import com.techbuildding.demoTechBuildding.service.BoqItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contracts/{contractId}/boq-items")
@RequiredArgsConstructor
public class BoqItemController {

    private final BoqItemService boqItemService;

    @PostMapping
    public ResponseData<BoqItemResponseDTO> createBoqItem(@PathVariable("contractId") Integer contractId, @RequestBody BoqItemRequestDTO request) {
        request.setContractId(contractId);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", boqItemService.createBoqItem(request));
    }

    @GetMapping
    public ResponseData<List<BoqItemResponseDTO>> getBoqItemsByContract(@PathVariable("contractId") Integer contractId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", boqItemService.getBoqItemsByContract(contractId));
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteBoqItem(@PathVariable("id") Integer id) {
        boqItemService.deleteBoqItem(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted");
    }
}
