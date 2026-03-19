package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.UserHasRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserHasRoleRepository extends JpaRepository<UserHasRole, UserHasRole.UserHasRoleId> {

    List<UserHasRole> findByUserId(Long userId);

    List<UserHasRole> findByRoleId(Integer roleId);

    void deleteByUserId(Long userId);
}
