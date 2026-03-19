package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findBySubmissionTypeAndReferenceId(String type, Long referenceId);
    List<Submission> findByProjectId(Integer projectId);
}
