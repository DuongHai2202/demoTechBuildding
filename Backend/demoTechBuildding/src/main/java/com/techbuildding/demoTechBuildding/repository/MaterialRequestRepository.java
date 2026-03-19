package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.MaterialRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Integer> {

    List<MaterialRequest> findByProjectId(Integer projectId);

    List<MaterialRequest> findByRequesterId(Long requesterId);

    List<MaterialRequest> findByStatus(String status);
    
    long countByMaterialId(Integer materialId);
}
