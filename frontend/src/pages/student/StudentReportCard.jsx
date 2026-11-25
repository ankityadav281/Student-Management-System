import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/studentService';
import { gradeService } from '../../services/gradeService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Award, Printer, CheckCircle2 } from 'lucide-react';
import { getGradeBadgeColor } from '../../utils/formatters';

const StudentReportCard = () => {
  const { user } = useAuth();
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportCard = async () => {
      try {
        const allStudents = await studentService.getAll();
        const matched = allStudents.find(s => s.email === user?.email) || allStudents[0];
        if (matched) {
          const data = await gradeService.getReportCard(matched.id);
          setReportCard(data);
        }
      } catch (err) {
        console.warn('Report card fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReportCard();
  }, [user]);

  if (loading) return <LoadingSpinner text="Generating Official Academic Report Card..." />;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Official Academic Report Card</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)' }}>Certified Semester Academic Evaluation</p>
        </div>
        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer size={15} />
          <span>Print / Save PDF</span>
        </button>
      </div>

      <div className="card" style={{ padding: '36px' }}>
        {/* Certificate Header */}
        <div style={{
          textAlign: 'center',
          paddingBottom: '24px',
          borderBottom: '2px solid var(--slate-200)',
          marginBottom: '28px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
            STUDENT MANAGEMENT SYSTEM
          </h2>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>
            ACADEMIC PERFORMANCE & TRANSCRIPT RECORD
          </div>
        </div>

        {/* Student Data Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          fontSize: '13.5px',
          marginBottom: '28px'
        }}>
          <div>Student Name: <strong>{reportCard?.student?.name}</strong></div>
          <div>Student ID: <strong>{reportCard?.student?.student_id}</strong></div>
          <div>Department: <strong>{reportCard?.student?.department}</strong></div>
          <div>Academic Year: <strong>{reportCard?.student?.year}</strong></div>
        </div>

        {/* Exam Breakdown Table */}
        <div className="table-container" style={{ marginBottom: '28px' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {reportCard?.records?.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.subject}</td>
                  <td>{r.exam_type}</td>
                  <td>{r.marks_obtained} / {r.max_marks}</td>
                  <td style={{ fontWeight: 700 }}>{r.percentage}%</td>
                  <td>
                    <span className={`badge ${getGradeBadgeColor(r.grade)}`}>
                      {r.grade}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{r.gpa.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evaluation Summary Strip */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '14px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              FINAL ASSESSMENT
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>
              Cumulative Average: {reportCard?.summary?.cumulative_percentage}%
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
              Attendance Compliance: {reportCard?.summary?.attendance_pct}%
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              CUMULATIVE CGPA
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#38bdf8' }}>
              {reportCard?.summary?.cgpa}
            </div>
            <span style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '6px',
              background: reportCard?.summary?.result_status === 'PASS' ? '#065f46' : '#991b1b',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800
            }}>
              {reportCard?.summary?.result_status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportCard;
