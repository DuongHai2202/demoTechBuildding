package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {

    List<WorkLog> findByProjectId(Integer projectId);

    List<WorkLog> findByProjectIdAndLogDateBetween(Integer projectId, LocalDate startDate, LocalDate endDate);
}
