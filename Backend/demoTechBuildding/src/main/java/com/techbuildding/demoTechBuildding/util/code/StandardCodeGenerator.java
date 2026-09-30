package com.techbuildding.demoTechBuildding.util.code;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.function.Predicate;

/**
 * Generates collision-safe, readable business codes.
 *
 * A row is locked with SELECT ... FOR UPDATE before the counter advances, so
 * concurrent requests cannot receive the same generated value. User-entered
 * values are intentionally not overwritten by this service.
 */
@Service
@RequiredArgsConstructor
public class StandardCodeGenerator {

    private final EntityManager entityManager;

    @Transactional
    public String next(StandardCodeType type, Predicate<String> alreadyExists) {
        int year = Year.now().getValue();
        String sequenceKey = type.getKey() + "-" + year;

        for (int attempt = 0; attempt < 100; attempt++) {
            entityManager.createNativeQuery("""
                    INSERT IGNORE INTO tbl_code_sequences(sequence_key, next_value)
                    VALUES (:sequenceKey, 1)
                    """)
                    .setParameter("sequenceKey", sequenceKey)
                    .executeUpdate();

            Number current = (Number) entityManager.createNativeQuery("""
                    SELECT next_value
                    FROM tbl_code_sequences
                    WHERE sequence_key = :sequenceKey
                    FOR UPDATE
                    """)
                    .setParameter("sequenceKey", sequenceKey)
                    .getSingleResult();

            long value = current.longValue();
            entityManager.createNativeQuery("""
                    UPDATE tbl_code_sequences
                    SET next_value = :nextValue
                    WHERE sequence_key = :sequenceKey
                    """)
                    .setParameter("nextValue", value + 1)
                    .setParameter("sequenceKey", sequenceKey)
                    .executeUpdate();

            String candidate = "%s-%d-%04d".formatted(type.getPrefix(), year, value);
            if (alreadyExists == null || !alreadyExists.test(candidate)) {
                return candidate;
            }
        }

        throw new IllegalStateException("Không thể sinh mã mới cho loại " + type.getKey());
    }

    public String next(StandardCodeType type) {
        return next(type, null);
    }

    public String cleanProvidedCode(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        return code.trim();
    }
}
