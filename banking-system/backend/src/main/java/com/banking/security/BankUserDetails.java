package com.banking.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

public record BankUserDetails(com.banking.entity.User user) implements UserDetails {
    @Override public String getUsername() { return user.getUsername(); }
    @Override public String getPassword() { return user.getPasswordHash(); }
    @Override public boolean isAccountNonLocked()  { return !user.getIsLocked(); }
    @Override public boolean isEnabled()           { return user.getIsActive(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
            .map(r -> new SimpleGrantedAuthority(r.getName()))
            .collect(Collectors.toSet());
    }
    public Long getId() { return user.getId(); }
}
