package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {

    List<AttendanceLog> findByUserIdAndProjectId(Long userId, Integer projectId);

    // Tìm bản ghi chấm công hôm nay (chưa checkout) của user tại project
    Optional<AttendanceLog> findByUserIdAndProjectIdAndCheckOutAtIsNull(Long userId, Integer projectId);

    // Lấy lịch sử chấm công theo khoảng thời gian
    List<AttendanceLog> findByProjectIdAndCheckInAtBetween(Integer projectId, LocalDateTime start, LocalDateTime end);

    List<AttendanceLog> findByCheckInAtBetween(LocalDateTime start, LocalDateTime end);

    // Tìm toàn bộ log của user tại project trong khoảng thời gian
    List<AttendanceLog> findByUserIdAndProjectIdAndCheckInAtBetween(Long userId, Integer projectId, LocalDateTime start, LocalDateTime end);
}
