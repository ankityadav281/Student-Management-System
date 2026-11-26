import React, { useState, useEffect } from 'react';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { Award, Printer, ArrowLeft } from 'lucide-react';
import { getGradeBadgeColor, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const StudentReportCard = () => {
  const { user } = useAuth();
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const students = await studentService.getAll();
        const found = Array.isArray(students) ? students[0] : null;
        if (found) {
          const data = await gradeService.getReportCard(found.student_id);
          setReportCard(data);
        }
      } catch (err) {
        console.warn('Report card fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [user]);

  if (loading) return <LoadingSpinner text="Generating Official Academic Transcript..." />;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>Academic Report Card</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>Certified Semester Academic Evaluation</p>
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
          borderBottom: '2px solid var(--color-border)',
          marginBottom: '28px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-primary-dark)', letterSpacing: '-0.5px' }}>
            STUDENT MANAGEMENT SYSTEM
          </h2>
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>
            ACADEMIC PERFORMANCE & TRANSCRIPT RECORD
          </div>
        </div>

        {/* Student Data Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          background: 'var(--color-hover)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: '13.5px',
          marginBottom: '28px',
          color: 'var(--color-text-primary)'
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
                  <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{r.subject}</td>
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
          background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>SEMESTER CGPA</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-primary-light)' }}>
              {reportCard?.summary?.cgpa || '0.0'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>OVERALL GRADE</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>
              {reportCard?.summary?.overall_grade || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>RESULT STATUS</div>
            <div style={{ 
              fontSize: '22px', 
              fontWeight: 800, 
              color: reportCard?.summary?.result_status === 'PASS' ? '#86EFAC' : '#FCA5A5' 
            }}>
              {reportCard?.summary?.result_status || 'PASS'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>ATTENDANCE</div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>
              {reportCard?.summary?.attendance_pct || 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportCard;
