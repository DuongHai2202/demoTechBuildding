package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.RoleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {
    List<RoleRequest> findByUserId(Long userId);
    List<RoleRequest> findByStatus(String status);
}
