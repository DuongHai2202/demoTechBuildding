package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.design.DesignSheetRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.design.DesignSheetResponseDTO;
import com.techbuildding.demoTechBuildding.service.DesignSheetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/design-sheets")
@RequiredArgsConstructor
@Tag(name = "Design Sheet Controller", description = "Endpoints for managing design documents and sheets")
public class DesignSheetController {

    private final DesignSheetService designSheetService;

    @Operation(summary = "Upload a new design sheet")
    @PostMapping
    public ResponseData<DesignSheetResponseDTO> addSheet(@RequestBody DesignSheetRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", designSheetService.addSheet(request));
    }

    @Operation(summary = "Get design sheets by project and optional zone")
    @GetMapping("/project/{projectId}")
    public ResponseData<List<DesignSheetResponseDTO>> getSheets(
            @PathVariable("projectId") Integer projectId,
            @RequestParam(name = "zoneId", required = false) Integer zoneId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", designSheetService.getSheetsByProject(projectId, zoneId));
    }

    @Operation(summary = "Update a design sheet")
    @PutMapping("/{id}")
    public ResponseData<DesignSheetResponseDTO> updateSheet(
            @PathVariable("id") Integer id,
            @RequestBody DesignSheetRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Updated", designSheetService.updateSheet(id, request));
    }

    @Operation(summary = "Delete a design sheet")
    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteSheet(@PathVariable("id") Integer id) {
        designSheetService.deleteSheet(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted");
    }
}
