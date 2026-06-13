package com.banking.service;

import com.banking.dto.StatementRequest;
import com.banking.entity.Account;
import com.banking.entity.Transaction;
import com.banking.exception.BankingException;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service @RequiredArgsConstructor @Slf4j
public class StatementService {
    private final AccountRepository accountRepo;
    private final TransactionRepository txnRepo;

    public byte[] generateStatementPdf(Long userId, StatementRequest req) {
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);

        List<Transaction> txns = txnRepo.findByAccountAndDateRange(
            req.accountId,
            req.fromDate.atStartOfDay(),
            req.toDate.atTime(23, 59, 59),
            Pageable.unpaged()).getContent();

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Font titleFont  = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 9);

            Paragraph title = new Paragraph("ACCOUNT STATEMENT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);
            doc.add(new Paragraph(" "));

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            addCell(infoTable, "Account Number:", headerFont);
            addCell(infoTable, acc.getAccountNumber(), normalFont);
            addCell(infoTable, "Account Holder:", headerFont);
            addCell(infoTable, acc.getUser().getFirstName() + " " + acc.getUser().getLastName(), normalFont);
            addCell(infoTable, "Branch:", headerFont);
            addCell(infoTable, acc.getBranch().getBranchName(), normalFont);
            addCell(infoTable, "IFSC:", headerFont);
            addCell(infoTable, acc.getBranch().getIfscCode(), normalFont);
            addCell(infoTable, "Period:", headerFont);
            addCell(infoTable, req.fromDate + " to " + req.toDate, normalFont);
            addCell(infoTable, "Current Balance:", headerFont);
            addCell(infoTable, "₹" + acc.getBalance(), normalFont);
            doc.add(infoTable);
            doc.add(new Paragraph(" "));

            PdfPTable txnTable = new PdfPTable(6);
            txnTable.setWidthPercentage(100);
            txnTable.setWidths(new float[]{2f, 3f, 2f, 1.5f, 1.5f, 1.5f});

            String[] headers = {"Date", "Description", "Ref No", "Debit", "Credit", "Balance"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                cell.setPadding(5);
                txnTable.addCell(cell);
            }

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            for (Transaction t : txns) {
                txnTable.addCell(new Phrase(t.getInitiatedAt().format(fmt), normalFont));
                txnTable.addCell(new Phrase(t.getDescription() != null ? t.getDescription() : t.getTransactionType().name(), normalFont));
                txnTable.addCell(new Phrase(t.getTransactionRef(), normalFont));
                boolean isDebit = t.getFromAccount() != null && t.getFromAccount().getId().equals(req.accountId);
                txnTable.addCell(new Phrase(isDebit ? "₹" + t.getAmount() : "-", normalFont));
                txnTable.addCell(new Phrase(!isDebit ? "₹" + t.getAmount() : "-", normalFont));
                txnTable.addCell(new Phrase(t.getBalanceAfter() != null ? "₹" + t.getBalanceAfter() : "-", normalFont));
            }

            doc.add(txnTable);
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("This is a system-generated statement. No signature required.", normalFont));
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new BankingException("Failed to generate statement: " + e.getMessage(), 500);
        }
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell);
    }
}
