package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.entity.BiddingPackage;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.exception.ResourceNotFoundException;
import com.techbuildding.demoTechBuildding.repository.BidSubmissionRepository;
import com.techbuildding.demoTechBuildding.repository.BiddingPackageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BiddingDeletionTest {
    @Mock BiddingPackageRepository packages;
    @Mock BidSubmissionRepository submissions;
    @InjectMocks BiddingServiceImpl service;

    @Test void deletesPackageWithoutSubmissions() {
        BiddingPackage item = new BiddingPackage();
        when(packages.findById(7)).thenReturn(Optional.of(item));
        service.deletePackage(7);
        verify(packages).delete(item);
    }

    @Test void preservesPackageWithSubmissions() {
        when(packages.findById(7)).thenReturn(Optional.of(new BiddingPackage()));
        when(submissions.existsByBiddingPackageId(7)).thenReturn(true);
        assertThrows(BadRequestException.class, () -> service.deletePackage(7));
        verify(packages, never()).delete(any(BiddingPackage.class));
    }

    @Test void reportsMissingPackage() {
        when(packages.findById(7)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.deletePackage(7));
        verify(packages, never()).delete(any(BiddingPackage.class));
    }
}
