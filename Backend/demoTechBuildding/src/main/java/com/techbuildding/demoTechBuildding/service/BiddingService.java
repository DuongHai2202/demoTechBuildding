package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.bidding.BidSubmissionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.bidding.BiddingPackageRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.bidding.BidSubmissionResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.bidding.BiddingPackageResponseDTO;

import java.util.List;

public interface BiddingService {
    BiddingPackageResponseDTO createPackage(BiddingPackageRequestDTO request);
    List<BiddingPackageResponseDTO> getPackagesByProject(Integer projectId);
    List<BiddingPackageResponseDTO> getAllPackages();
    BiddingPackageResponseDTO getPackageById(Integer id);
    BiddingPackageResponseDTO updatePackageStatus(Integer id, String status);
    
    BidSubmissionResponseDTO submitBid(BidSubmissionRequestDTO request);
    List<BidSubmissionResponseDTO> getSubmissionsByPackage(Integer packageId);
    BidSubmissionResponseDTO updateSubmissionStatus(Integer id, String status, String notes);
}
