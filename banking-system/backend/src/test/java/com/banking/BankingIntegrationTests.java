package com.banking;

import com.banking.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class BankingIntegrationTests {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    static String accessToken;
    static String adminToken;

    // ── Auth ────────────────────────────────────────────────
    @Test @Order(1)
    @DisplayName("POST /auth/register → 201 Created")
    void register_returns201() throws Exception {
        var req = new AuthDTOs.RegisterRequest(
            "integtest","integtest@email.com","Password@123",
            "Integ","Test","9111111111",null,"MALE");

        mvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.username").value("integtest"));
    }

    @Test @Order(2)
    @DisplayName("POST /auth/login → 200 with tokens")
    void login_returns200WithTokens() throws Exception {
        var req = new AuthDTOs.LoginRequest("integtest", "Password@123");

        MvcResult result = mvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").exists())
            .andReturn();

        var body = mapper.readTree(result.getResponse().getContentAsString());
        accessToken = body.path("data").path("accessToken").asText();
    }

    @Test @Order(3)
    @DisplayName("POST /auth/login with wrong password → 401")
    void login_wrongPassword_returns401() throws Exception {
        var req = new AuthDTOs.LoginRequest("integtest", "WrongPass!");
        mvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isUnauthorized());
    }

    @Test @Order(4)
    @DisplayName("GET /users/me without token → 401")
    void getProfile_noToken_returns401() throws Exception {
        mvc.perform(get("/users/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test @Order(5)
    @DisplayName("GET /users/me with token → 200")
    void getProfile_withToken_returns200() throws Exception {
        mvc.perform(get("/users/me")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.username").value("integtest"));
    }

    // ── Admin auth ──────────────────────────────────────────
    @Test @Order(6)
    @DisplayName("Admin login → token")
    void adminLogin() throws Exception {
        var req = new AuthDTOs.LoginRequest("admin", "Admin@123");
        MvcResult result = mvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andReturn();

        var body = mapper.readTree(result.getResponse().getContentAsString());
        adminToken = body.path("data").path("accessToken").asText();
    }

    @Test @Order(7)
    @DisplayName("GET /admin/dashboard with admin token → 200")
    void adminDashboard_returns200() throws Exception {
        mvc.perform(get("/admin/dashboard")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalAccounts").exists());
    }

    @Test @Order(8)
    @DisplayName("GET /admin/dashboard with customer token → 403")
    void adminDashboard_customerToken_returns403() throws Exception {
        mvc.perform(get("/admin/dashboard")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isForbidden());
    }

    // ── Accounts ────────────────────────────────────────────
    @Test @Order(9)
    @DisplayName("GET /accounts → 200 list")
    void getAccounts_returns200() throws Exception {
        mvc.perform(get("/accounts")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test @Order(10)
    @DisplayName("GET /accounts/types → 200 list")
    void getAccountTypes_returns200() throws Exception {
        mvc.perform(get("/accounts/types")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray());
    }

    // ── Loans ────────────────────────────────────────────────
    @Test @Order(11)
    @DisplayName("GET /loans/types → 200")
    void getLoanTypes_returns200() throws Exception {
        mvc.perform(get("/loans/types")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test @Order(12)
    @DisplayName("GET /loans/calculate → 200 with EMI")
    void calculateEmi_returns200() throws Exception {
        mvc.perform(get("/loans/calculate")
                .param("loanTypeId", "1")
                .param("amount", "100000")
                .param("tenureMonths", "12")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.emi").exists());
    }

    // ── Transactions ────────────────────────────────────────
    @Test @Order(13)
    @DisplayName("GET /transactions → 200 paginated")
    void getTransactions_returns200() throws Exception {
        mvc.perform(get("/transactions")
                .param("page", "0").param("size", "10")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk());
    }

    // ── Validation ──────────────────────────────────────────
    @Test @Order(14)
    @DisplayName("POST /auth/register with invalid email → 400")
    void register_invalidEmail_returns400() throws Exception {
        var req = new AuthDTOs.RegisterRequest(
            "baduser","not-an-email","Password@123",
            "Bad","User","9000000002",null,"MALE");

        mvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest());
    }

    @Test @Order(15)
    @DisplayName("POST /auth/register with weak password → 400")
    void register_weakPassword_returns400() throws Exception {
        var req = new AuthDTOs.RegisterRequest(
            "weakpassuser","weak@email.com","password",
            "Weak","User","9000000003",null,"MALE");

        mvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest());
    }
}
