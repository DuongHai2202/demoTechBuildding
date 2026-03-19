package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);
}
