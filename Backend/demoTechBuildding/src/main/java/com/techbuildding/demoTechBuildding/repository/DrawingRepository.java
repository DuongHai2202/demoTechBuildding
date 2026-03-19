package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.Drawing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrawingRepository extends JpaRepository<Drawing, Integer> {
    List<Drawing> findByProjectId(Integer projectId);
    List<Drawing> findByContractId(Integer contractId);
}
