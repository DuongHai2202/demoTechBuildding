package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.RoleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {
    List<RoleRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<RoleRequest> findFirstByUserIdAndStatusIgnoreCaseOrderByCreatedAtDesc(Long userId, String status);
    List<RoleRequest> findByStatus(String status);
}
