package com.banking.repository;

import com.banking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<User> findByEmailVerifyToken(String token);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_CUSTOMER' " +
           "AND (:search IS NULL OR :search = '' OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<User> findCustomers(@Param("search") String search, Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_EMPLOYEE'")
    Page<User> findEmployees(Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :role")
    long countByRole(@Param("role") String role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt BETWEEN :from AND :to")
    long countRegisteredBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT u FROM User u WHERE u.passwordResetToken = :token")
    Optional<User> findByPasswordResetToken(@Param("token") String token);
}

