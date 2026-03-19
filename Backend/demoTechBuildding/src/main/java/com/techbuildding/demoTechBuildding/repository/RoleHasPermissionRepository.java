package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.RoleHasPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleHasPermissionRepository
        extends JpaRepository<RoleHasPermission, RoleHasPermission.RoleHasPermissionId> {

    List<RoleHasPermission> findByRoleId(Integer roleId);

    void deleteByRoleId(Integer roleId);
}
