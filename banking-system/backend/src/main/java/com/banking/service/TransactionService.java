package com.banking.service;

import com.banking.dto.DepositRequest;
import com.banking.dto.FundTransferRequest;
import com.banking.dto.TransactionResponse;
import com.banking.dto.WithdrawalRequest;
import com.banking.entity.Account;
import com.banking.entity.ScheduledTransfer;
import com.banking.entity.Transaction;
import com.banking.exception.BankingException;
import com.banking.repository.AccountRepository;
import com.banking.repository.ScheduledTransferRepository;
import com.banking.repository.TransactionRepository;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class TransactionService {
    private final TransactionRepository txnRepo;
    private final AccountRepository accountRepo;
    private final NotificationService notificationService;
    private final ScheduledTransferRepository scheduledRepo;

    @Transactional
    public TransactionResponse deposit(DepositRequest req, Long userId) {
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);
        if (acc.getStatus() != Account.AccountStatus.ACTIVE)
            throw new BankingException("Account is not active", 400);

        BigDecimal before = acc.getBalance();
        acc.setBalance(before.add(req.amount));
        acc.setAvailableBalance(acc.getAvailableBalance().add(req.amount));
        acc.setLastTransactionAt(LocalDateTime.now());
        accountRepo.save(acc);

        Transaction txn = Transaction.builder()
            .transactionRef(generateRef())
            .toAccount(acc)
            .transactionType(Transaction.TransactionType.DEPOSIT)
            .amount(req.amount)
            .balanceBefore(before)
            .balanceAfter(acc.getBalance())
            .description(req.description != null ? req.description : "Cash deposit")
            .status(Transaction.TransactionStatus.SUCCESS)
            .channel(req.channel != null ? Transaction.Channel.valueOf(req.channel) : Transaction.Channel.BRANCH)
            .initiatedAt(LocalDateTime.now())
            .completedAt(LocalDateTime.now())
            .build();

        txn = txnRepo.save(txn);
        notificationService.sendTransactionAlert(acc.getUser(), txn);
        return mapToResponse(txn);
    }

    @Transactional
    public TransactionResponse withdraw(WithdrawalRequest req, Long userId) {
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);
        if (acc.getStatus() != Account.AccountStatus.ACTIVE)
            throw new BankingException("Account is not active", 400);
        if (acc.getAvailableBalance().compareTo(req.amount) < 0)
            throw new BankingException("Insufficient balance", 400);

        BigDecimal before = acc.getBalance();
        acc.setBalance(before.subtract(req.amount));
        acc.setAvailableBalance(acc.getAvailableBalance().subtract(req.amount));
        acc.setLastTransactionAt(LocalDateTime.now());
        accountRepo.save(acc);

        Transaction txn = Transaction.builder()
            .transactionRef(generateRef())
            .fromAccount(acc)
            .transactionType(Transaction.TransactionType.WITHDRAWAL)
            .amount(req.amount)
            .balanceBefore(before)
            .balanceAfter(acc.getBalance())
            .description(req.description != null ? req.description : "Cash withdrawal")
            .status(Transaction.TransactionStatus.SUCCESS)
            .channel(req.channel != null ? Transaction.Channel.valueOf(req.channel) : Transaction.Channel.ATM)
            .initiatedAt(LocalDateTime.now())
            .completedAt(LocalDateTime.now())
            .build();

        txn = txnRepo.save(txn);
        notificationService.sendTransactionAlert(acc.getUser(), txn);
        return mapToResponse(txn);
    }

    @Transactional
    public TransactionResponse transfer(FundTransferRequest req, Long userId) {
        Account from = accountRepo.findById(req.fromAccountId)
            .orElseThrow(() -> new BankingException("Source account not found", 404));
        Account to = accountRepo.findByAccountNumber(req.toAccountNumber)
            .orElseThrow(() -> new BankingException("Destination account not found", 404));

        if (!from.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);
        if (from.getStatus() != Account.AccountStatus.ACTIVE)
            throw new BankingException("Source account is not active", 400);
        if (to.getStatus() != Account.AccountStatus.ACTIVE)
            throw new BankingException("Destination account is not active", 400);
        if (from.getAvailableBalance().compareTo(req.amount) < 0)
            throw new BankingException("Insufficient balance", 400);
        if (from.getId().equals(to.getId()))
            throw new BankingException("Cannot transfer to same account", 400);

        BigDecimal fromBefore = from.getBalance();
        from.setBalance(fromBefore.subtract(req.amount));
        from.setAvailableBalance(from.getAvailableBalance().subtract(req.amount));
        from.setLastTransactionAt(LocalDateTime.now());

        BigDecimal toBefore = to.getBalance();
        to.setBalance(toBefore.add(req.amount));
        to.setAvailableBalance(to.getAvailableBalance().add(req.amount));
        to.setLastTransactionAt(LocalDateTime.now());

        accountRepo.save(from);
        accountRepo.save(to);

        Transaction txn = Transaction.builder()
            .transactionRef(generateRef())
            .fromAccount(from)
            .toAccount(to)
            .transactionType(Transaction.TransactionType.TRANSFER)
            .amount(req.amount)
            .balanceBefore(fromBefore)
            .balanceAfter(from.getBalance())
            .description(req.description != null ? req.description : "Fund transfer")
            .status(Transaction.TransactionStatus.SUCCESS)
            .channel(Transaction.Channel.NETBANKING)
            .initiatedAt(LocalDateTime.now())
            .completedAt(LocalDateTime.now())
            .build();

        txn = txnRepo.save(txn);
        notificationService.sendTransactionAlert(from.getUser(), txn);
        notificationService.sendTransactionAlert(to.getUser(), txn);
        return mapToResponse(txn);
    }

    public Page<TransactionResponse> getTransactions(Long userId, int page, int size) {
        return txnRepo.findByUserId(userId, PageRequest.of(page, size, Sort.by("initiatedAt").descending()))
            .map(this::mapToResponse);
    }

    public TransactionResponse getByRef(String ref) {
        return txnRepo.findByTransactionRef(ref)
            .map(this::mapToResponse)
            .orElseThrow(() -> new BankingException("Transaction not found", 404));
    }

    private String generateRef() {
        return "TXN" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }

    public Page<TransactionResponse> searchTransactions(
            Long userId, String type, String status,
            String from, String to, int page, int size) {

        Transaction.TransactionType txnType = null;
        Transaction.TransactionStatus txnStatus = null;
        LocalDateTime fromDt = null;
        LocalDateTime toDt   = null;

        try { if (type   != null && !type.isBlank())   txnType   = Transaction.TransactionType.valueOf(type); }   catch (IllegalArgumentException ignored) {}
        try { if (status != null && !status.isBlank()) txnStatus = Transaction.TransactionStatus.valueOf(status); } catch (IllegalArgumentException ignored) {}
        try { if (from != null && !from.isBlank()) fromDt = LocalDate.parse(from).atStartOfDay(); }               catch (Exception ignored) {}
        try { if (to   != null && !to.isBlank())   toDt   = LocalDate.parse(to).atTime(23, 59, 59); }             catch (Exception ignored) {}

        return txnRepo.searchTransactions(userId, txnType, txnStatus, fromDt, toDt,
                PageRequest.of(page, size, Sort.by("initiatedAt").descending()))
                .map(this::mapToResponse);
    }

    public byte[] generateReceipt(String ref, Long userId) {
        Transaction t = txnRepo.findByTransactionRef(ref)
                .orElseThrow(() -> new BankingException("Transaction not found", 404));

        // Verify ownership
        boolean isOwner = (t.getFromAccount() != null && t.getFromAccount().getUser().getId().equals(userId))
                       || (t.getToAccount()   != null && t.getToAccount().getUser().getId().equals(userId));
        if (!isOwner) throw new BankingException("Unauthorized", 403);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(new Rectangle(400, 600));
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Font title  = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
            Font header = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
            Font normal = new Font(Font.FontFamily.HELVETICA, 10);
            Font small  = new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC);

            // Header
            Paragraph p = new Paragraph("TRANSACTION RECEIPT", title);
            p.setAlignment(Element.ALIGN_CENTER);
            doc.add(p);
            doc.add(new Paragraph("Banking Management System", small) {{ setAlignment(Element.ALIGN_CENTER); }});
            doc.add(new Paragraph(" "));

            // Status badge
            String statusText = "✓ " + t.getStatus().name();
            Paragraph status = new Paragraph(statusText, new Font(Font.FontFamily.HELVETICA, 12,
                    Font.BOLD, t.getStatus() == Transaction.TransactionStatus.SUCCESS
                    ? new BaseColor(16, 185, 129) : new BaseColor(239, 68, 68)));
            status.setAlignment(Element.ALIGN_CENTER);
            doc.add(status);
            doc.add(new Paragraph(" "));

            // Amount
            Paragraph amount = new Paragraph("₹" + t.getAmount().toPlainString(),
                    new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD));
            amount.setAlignment(Element.ALIGN_CENTER);
            doc.add(amount);
            doc.add(new Paragraph(" "));

            // Details table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm:ss");

            Object[][] rows = {
                {"Reference No",   t.getTransactionRef()},
                {"Type",           t.getTransactionType().name().replace("_", " ")},
                {"Channel",        t.getChannel().name()},
                {"Date & Time",    t.getInitiatedAt() != null ? t.getInitiatedAt().format(fmt) : "—"},
                {"From Account",   t.getFromAccount() != null ? t.getFromAccount().getAccountNumber() : "—"},
                {"To Account",     t.getToAccount()   != null ? t.getToAccount().getAccountNumber()   : "—"},
                {"Description",    t.getDescription() != null ? t.getDescription() : "—"},
                {"Balance After",  t.getBalanceAfter() != null ? "₹" + t.getBalanceAfter().toPlainString() : "—"},
            };

            for (Object[] row : rows) {
                PdfPCell keyCell = new PdfPCell(new Phrase((String) row[0], header));
                keyCell.setBorder(Rectangle.NO_BORDER);
                keyCell.setPadding(4);
                keyCell.setBackgroundColor(new BaseColor(249, 250, 251));
                table.addCell(keyCell);

                PdfPCell valCell = new PdfPCell(new Phrase((String) row[1], normal));
                valCell.setBorder(Rectangle.NO_BORDER);
                valCell.setPadding(4);
                table.addCell(valCell);
            }
            doc.add(table);

            doc.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("This is a system-generated receipt. No signature required.", small);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new BankingException("Failed to generate receipt: " + e.getMessage(), 500);
        }
    }

    @Transactional
    public Map<String, Object> scheduleTransfer(Map<String, Object> req, Long userId) {
        Long fromId = Long.valueOf(req.get("fromAccountId").toString());
        Long toId   = Long.valueOf(req.get("toAccountId").toString());
        BigDecimal amount = new BigDecimal(req.get("amount").toString());
        String freq = req.getOrDefault("frequency", "ONCE").toString();
        String nextDate = req.get("nextExecutionDate").toString();

        Account from = accountRepo.findById(fromId)
                .orElseThrow(() -> new BankingException("Source account not found", 404));
        Account to = accountRepo.findById(toId)
                .orElseThrow(() -> new BankingException("Destination account not found", 404));

        if (!from.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);

        ScheduledTransfer st = ScheduledTransfer.builder()
                .fromAccount(from)
                .toAccount(to)
                .amount(amount)
                .description(req.getOrDefault("description", "Scheduled transfer").toString())
                .frequency(ScheduledTransfer.Frequency.valueOf(freq))
                .nextExecutionDate(LocalDate.parse(nextDate))
                .endDate(req.get("endDate") != null ? LocalDate.parse(req.get("endDate").toString()) : null)
                .status(ScheduledTransfer.TransferStatus.ACTIVE)
                .build();

        st = scheduledRepo.save(st);
        return Map.<String, Object>of(
            "id", st.getId(),
            "fromAccount", from.getAccountNumber(),
            "toAccount", to.getAccountNumber(),
            "amount", amount,
            "frequency", freq,
            "nextExecutionDate", nextDate,
            "status", "ACTIVE"
        );
    }

    public List<Map<String, Object>> getScheduledTransfers(Long userId) {
        return scheduledRepo.findByFromAccountUserId(userId).stream()
                .map(st -> Map.<String, Object>of(
                    "id",                  st.getId(),
                    "fromAccount",         st.getFromAccount().getAccountNumber(),
                    "toAccount",           st.getToAccount().getAccountNumber(),
                    "amount",              st.getAmount(),
                    "frequency",           st.getFrequency().name(),
                    "nextExecutionDate",   st.getNextExecutionDate().toString(),
                    "status",              st.getStatus().name(),
                    "description",         st.getDescription() != null ? st.getDescription() : ""
                ))
                .collect(Collectors.toList());
    }

    public TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .transactionRef(t.getTransactionRef())
            .transactionType(t.getTransactionType().name())
            .amount(t.getAmount())
            .currency(t.getCurrency())
            .status(t.getStatus().name())
            .channel(t.getChannel().name())
            .description(t.getDescription())
            .fromAccount(t.getFromAccount() != null ? t.getFromAccount().getAccountNumber() : null)
            .toAccount(t.getToAccount() != null ? t.getToAccount().getAccountNumber() : null)
            .balanceBefore(t.getBalanceBefore())
            .balanceAfter(t.getBalanceAfter())
            .initiatedAt(t.getInitiatedAt())
            .completedAt(t.getCompletedAt())
            .build();
    }
}
