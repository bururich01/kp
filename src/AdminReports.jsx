import React, { useState, useEffect } from 'react';
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow as MuiTableRow,
  Paper, Typography, Box, CircularProgress, Alert, TextField, Button, ButtonGroup
} from '@mui/material';
import { Download } from '@mui/icons-material';
import Layout from './components/Layout';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxCell, WidthType, BorderStyle } from 'docx';

const API_BASE = 'http://localhost:8000/api/v1';

const AdminReports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSalesReport = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE}/reports/sales`;
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSales(data);
    } catch (err) {
      setError('Не удалось загрузить отчёт');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSalesReport();
  };

  const exportToExcel = () => {
    const dataForExcel = sales.map(item => ({
      'Напиток': item.dish_name,
      'Количество проданных единиц': item.units_sold,
      'Общая выручка (руб.)': item.total_revenue,
      'Средний чек (руб.)': item.avg_check
    }));
    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчет по продажам');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `sales_report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Отчет по продажам', 14, 10);
    if (startDate && endDate) {
      doc.text(`Период: ${startDate} - ${endDate}`, 14, 20);
    }
    const tableData = sales.map(item => [
      item.dish_name,
      item.units_sold,
      item.total_revenue.toFixed(2),
      item.avg_check.toFixed(2)
    ]);
    doc.autoTable({
      startY: 30,
      head: [['Напиток', 'Количество', 'Выручка (руб.)', 'Средний чек (руб.)']],
      body: tableData,
    });
    doc.save(`sales_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportToDocx = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'Отчет по продажам',
            heading: 'Title',
          }),
          new Paragraph({
            text: `Период: ${startDate || 'все время'} - ${endDate || 'настоящее время'}`,
          }),
          new Paragraph({ text: '' }),
          new DocxTable({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new DocxTableRow({
                children: [
                  new DocxCell({ children: [new Paragraph('Напиток')] }),
                  new DocxCell({ children: [new Paragraph('Количество')] }),
                  new DocxCell({ children: [new Paragraph('Выручка (руб.)')] }),
                  new DocxCell({ children: [new Paragraph('Средний чек (руб.)')] }),
                ],
              }),
              ...sales.map(item => new DocxTableRow({
                children: [
                  new DocxCell({ children: [new Paragraph(item.dish_name)] }),
                  new DocxCell({ children: [new Paragraph(item.units_sold.toString())] }),
                  new DocxCell({ children: [new Paragraph(item.total_revenue.toFixed(2))] }),
                  new DocxCell({ children: [new Paragraph(item.avg_check.toFixed(2))] }),
                ],
              })),
            ],
          }),
        ],
      }],
    });
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `sales_report_${new Date().toISOString().slice(0,10)}.docx`);
    });
  };

  return (
    <Layout title="Отчёты">
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Отчёт по продажам напитков.
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Начальная дата"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Конечная дата"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button type="submit" variant="contained">Показать</Button>
        </form>
      </Paper>

      {sales.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <ButtonGroup variant="contained">
            <Button startIcon={<Download />} onClick={exportToExcel}>Excel (XLSX)</Button>
            <Button startIcon={<Download />} onClick={exportToPDF}>PDF</Button>
            <Button startIcon={<Download />} onClick={exportToDocx}>Word (DOCX)</Button>
          </ButtonGroup>
        </Box>
      )}

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#4e2e1e' }}>
              <MuiTableRow>
                <TableCell sx={{ color: 'white' }}>Напиток</TableCell>
                <TableCell sx={{ color: 'white' }}>Количество проданных единиц</TableCell>
                <TableCell sx={{ color: 'white' }}>Общая выручка (руб.)</TableCell>
                <TableCell sx={{ color: 'white' }}>Средний чек (руб.)</TableCell>
              </MuiTableRow>
            </TableHead>
            <TableBody>
              {sales.length === 0 ? (
                <MuiTableRow>
                  <TableCell colSpan={4} align="center">Нет данных за выбранный период</TableCell>
                </MuiTableRow>
              ) : (
                sales.map((item, idx) => (
                  <MuiTableRow key={idx}>
                    <TableCell>{item.dish_name}</TableCell>
                    <TableCell>{item.units_sold}</TableCell>
                    <TableCell>{item.total_revenue.toFixed(2)}</TableCell>
                    <TableCell>{item.avg_check.toFixed(2)}</TableCell>
                  </MuiTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Layout>
  );
};

export default AdminReports;