package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.SubmissionStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionStepRepository extends JpaRepository<SubmissionStep, Long> {
    List<SubmissionStep> findBySubmissionIdOrderByStepOrderAsc(Long submissionId);
}
