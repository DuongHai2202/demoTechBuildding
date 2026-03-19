package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.bidding.BidSubmissionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.bidding.BiddingPackageRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.bidding.BidSubmissionResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.bidding.BiddingPackageResponseDTO;
import com.techbuildding.demoTechBuildding.entity.BidSubmission;
import com.techbuildding.demoTechBuildding.entity.BiddingPackage;
import com.techbuildding.demoTechBuildding.entity.Partner;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.repository.BidSubmissionRepository;
import com.techbuildding.demoTechBuildding.repository.BiddingPackageRepository;
import com.techbuildding.demoTechBuildding.repository.PartnerRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.service.BiddingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BiddingServiceImpl implements BiddingService {

    private final BiddingPackageRepository packageRepository;
    private final BidSubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final PartnerRepository partnerRepository;

    @Override
    @Transactional
    public BiddingPackageResponseDTO createPackage(BiddingPackageRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        BiddingPackage biddingPackage = BiddingPackage.builder()
                .project(project)
                .packageCode(request.getPackageCode())
                .packageName(request.getPackageName())
                .description(request.getDescription())
                .budget(request.getBudget())
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .deadline(request.getDeadline())
                .criteria(request.getCriteria())
                .build();

        biddingPackage = packageRepository.save(biddingPackage);
        return mapToPackageResponse(biddingPackage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BiddingPackageResponseDTO> getPackagesByProject(Integer projectId) {
        return packageRepository.findByProjectId(projectId).stream()
                .map(this::mapToPackageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BiddingPackageResponseDTO> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::mapToPackageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BiddingPackageResponseDTO getPackageById(Integer id) {
        BiddingPackage biddingPackage = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bidding package not found: " + id));
        return mapToPackageResponse(biddingPackage);
    }

    @Override
    @Transactional
    public BiddingPackageResponseDTO updatePackageStatus(Integer id, String status) {
        BiddingPackage biddingPackage = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bidding package not found: " + id));
        biddingPackage.setStatus(status);
        biddingPackage = packageRepository.save(biddingPackage);
        return mapToPackageResponse(biddingPackage);
    }

    @Override
    @Transactional
    public BidSubmissionResponseDTO submitBid(BidSubmissionRequestDTO request) {
        BiddingPackage biddingPackage = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Bidding package not found: " + request.getPackageId()));
        
        Partner partner = partnerRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new RuntimeException("Partner not found: " + request.getPartnerId()));

        BidSubmission submission = BidSubmission.builder()
                .biddingPackage(biddingPackage)
                .partner(partner)
                .bidPrice(request.getBidPrice())
                .proposalFileUrl(request.getProposalFileUrl())
                .status("PENDING")
                .notes(request.getNotes())
                .build();

        submission = submissionRepository.save(submission);
        return mapToSubmissionResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BidSubmissionResponseDTO> getSubmissionsByPackage(Integer packageId) {
        return submissionRepository.findByBiddingPackageId(packageId).stream()
                .map(this::mapToSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BidSubmissionResponseDTO updateSubmissionStatus(Integer id, String status, String notes) {
        BidSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bid submission not found: " + id));
        
        submission.setStatus(status);
        if (notes != null) {
            submission.setNotes(notes);
        }
        
        submission = submissionRepository.save(submission);

        // If a bid is accepted, mark the package as CLOSED
        if ("ACCEPTED".equalsIgnoreCase(status)) {
            BiddingPackage bp = submission.getBiddingPackage();
            bp.setStatus("CLOSED");
            packageRepository.save(bp);

            // Optionally reject other pending submissions
            List<BidSubmission> others = submissionRepository.findByBiddingPackageId(bp.getId());
            for (BidSubmission other : others) {
                if (!other.getId().equals(id) && "PENDING".equalsIgnoreCase(other.getStatus())) {
                    other.setStatus("REJECTED");
                    submissionRepository.save(other);
                }
            }
        }
        
        return mapToSubmissionResponse(submission);
    }

    private BiddingPackageResponseDTO mapToPackageResponse(BiddingPackage bp) {
        return BiddingPackageResponseDTO.builder()
                .id(bp.getId())
                .projectId(bp.getProject().getId())
                .packageCode(bp.getPackageCode())
                .packageName(bp.getPackageName())
                .description(bp.getDescription())
                .budget(bp.getBudget())
                .status(bp.getStatus())
                .deadline(bp.getDeadline())
                .criteria(bp.getCriteria())
                .createdAt(bp.getCreatedAt())
                .build();
    }

    private BidSubmissionResponseDTO mapToSubmissionResponse(BidSubmission bs) {
        return BidSubmissionResponseDTO.builder()
                .id(bs.getId())
                .packageId(bs.getBiddingPackage().getId())
                .partnerId(bs.getPartner().getId())
                .partnerName(bs.getPartner().getName())
                .bidPrice(bs.getBidPrice())
                .proposalFileUrl(bs.getProposalFileUrl())
                .status(bs.getStatus())
                .notes(bs.getNotes())
                .submissionDate(bs.getCreatedAt())
                .build();
    }
}
