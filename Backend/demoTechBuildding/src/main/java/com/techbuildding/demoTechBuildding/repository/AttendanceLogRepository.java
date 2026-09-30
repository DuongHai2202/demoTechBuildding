package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {

    List<AttendanceLog> findByUserIdAndProjectId(Long userId, Integer projectId);

    // Chỉ một ca CHECKED_IN chưa checkout mới được xem là ca đang mở.
    // Bản ghi FAILED cũng có thể chưa có check_out_at nhưng không được khóa ca mới.
    @Query("select a from AttendanceLog a where a.user.id = :userId and a.project.id = :projectId "
            + "and a.status = 'CHECKED_IN' and a.checkOutAt is null")
    Optional<AttendanceLog> findActiveForUserAndProject(@Param("userId") Long userId,
            @Param("projectId") Integer projectId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from AttendanceLog a where a.user.id = :userId and a.project.id = :projectId "
            + "and a.status = 'CHECKED_IN' and a.checkOutAt is null")
    Optional<AttendanceLog> findActiveForUpdate(@Param("userId") Long userId, @Param("projectId") Integer projectId);

    List<AttendanceLog> findByUserIdAndProjectIdAndStatusAndCheckInAtBetweenOrderByCheckInAtDesc(
            Long userId, Integer projectId, String status, LocalDateTime start, LocalDateTime end);

    // Lấy lịch sử chấm công theo khoảng thời gian
    List<AttendanceLog> findByProjectIdAndCheckInAtBetween(Integer projectId, LocalDateTime start, LocalDateTime end);

    List<AttendanceLog> findByProjectIdAndCheckInAtBetweenOrderByCheckInAtDesc(Integer projectId, LocalDateTime start, LocalDateTime end);

    List<AttendanceLog> findByCheckInAtBetween(LocalDateTime start, LocalDateTime end);

    List<AttendanceLog> findByCheckInAtBetweenOrderByCheckInAtDesc(LocalDateTime start, LocalDateTime end);

    // Tìm toàn bộ log của user tại project trong khoảng thời gian
    List<AttendanceLog> findByUserIdAndProjectIdAndCheckInAtBetween(Long userId, Integer projectId, LocalDateTime start, LocalDateTime end);

    List<AttendanceLog> findByUserIdAndCheckInAtBetweenOrderByCheckInAtDesc(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("select a from AttendanceLog a where a.user.id = :userId and a.project.id = :projectId "
            + "and a.shiftAssignment.workDate = :workDate and a.status in :statuses "
            + "order by a.checkInAt asc")
    List<AttendanceLog> findByUserProjectAndShiftDateAndStatusIn(@Param("userId") Long userId,
            @Param("projectId") Integer projectId,
            @Param("workDate") LocalDate workDate,
            @Param("statuses") Collection<String> statuses);

    @Query("select count(a) > 0 from AttendanceLog a where a.shiftAssignment.id = :shiftAssignmentId and a.status in :statuses")
    boolean existsByShiftAssignmentAndStatusIn(@Param("shiftAssignmentId") Long shiftAssignmentId,
            @Param("statuses") Collection<String> statuses);
}
