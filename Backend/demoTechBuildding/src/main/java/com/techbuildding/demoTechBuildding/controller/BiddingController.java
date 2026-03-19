package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.bidding.BidSubmissionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.bidding.BiddingPackageRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.bidding.BidSubmissionResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.bidding.BiddingPackageResponseDTO;
import com.techbuildding.demoTechBuildding.service.BiddingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Bidding Controller", description = "Endpoints for tendering and contractor selection")
public class BiddingController {

    private final BiddingService biddingService;

    @Operation(summary = "Create a new bidding package")
    @PostMapping("/bidding-packages")
    public ResponseData<BiddingPackageResponseDTO> createPackage(@RequestBody BiddingPackageRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Package created", biddingService.createPackage(request));
    }

    @Operation(summary = "Get all bidding packages")
    @GetMapping("/bidding-packages")
    public ResponseData<List<BiddingPackageResponseDTO>> getAllPackages() {
        try {
            return new ResponseData<>(HttpStatus.OK.value(), "Success", biddingService.getAllPackages());
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseData<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error: " + e.getMessage(), null);
        }
    }

    @Operation(summary = "Get bidding packages by project")
    @GetMapping("/projects/{id}/bidding-packages")
    public ResponseData<List<BiddingPackageResponseDTO>> getPackages(@PathVariable("id") Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", biddingService.getPackagesByProject(projectId));
    }

    @Operation(summary = "Get bidding package by ID")
    @GetMapping("/bidding-packages/{id}")
    public ResponseData<BiddingPackageResponseDTO> getPackageById(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", biddingService.getPackageById(id));
    }

    @Operation(summary = "Update bidding package status")
    @PatchMapping("/bidding-packages/{id}/status")
    public ResponseData<BiddingPackageResponseDTO> updatePackageStatus(
            @PathVariable("id") Integer id,
            @RequestParam("status") String status) {
        return new ResponseData<>(HttpStatus.OK.value(), "Status updated", biddingService.updatePackageStatus(id, status));
    }

    @Operation(summary = "Submit a bid for a package")
    @PostMapping("/bid-submissions")
    public ResponseData<BidSubmissionResponseDTO> submitBid(@RequestBody BidSubmissionRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Bid submitted", biddingService.submitBid(request));
    }

    @Operation(summary = "Get submissions for a bidding package")
    @GetMapping("/bidding-packages/{id}/submissions")
    public ResponseData<List<BidSubmissionResponseDTO>> getSubmissions(@PathVariable("id") Integer packageId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", biddingService.getSubmissionsByPackage(packageId));
    }

    @Operation(summary = "Update bid submission status")
    @PatchMapping("/bid-submissions/{id}/status")
    public ResponseData<BidSubmissionResponseDTO> updateSubmissionStatus(
            @PathVariable("id") Integer id,
            @RequestParam("status") String status,
            @RequestParam(value = "notes", required = false) String notes) {
        return new ResponseData<>(HttpStatus.OK.value(), "Status updated", biddingService.updateSubmissionStatus(id, status, notes));
    }
}
