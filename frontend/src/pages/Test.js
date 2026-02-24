import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';

const Test = ({ onNavigate }) => {
  const [questions, setQuestions] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {submitTest } = useAuth();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await authAPI.getTestQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitTest(answers);
      // После успешного прохождения теста - на профиль
      onNavigate('profile');
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Ошибка при сохранении результатов. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  // Функция для выхода из теста
  const handleCancel = () => {
    if (window.confirm('Вы уверены? Весь прогресс будет потерян.')) {
      onNavigate('profile');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="vinyl-spinner"></div>
        <p>Загружаем вопросы...</p>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="error-container">
        <h2>Ой!</h2>
        <p>Не удалось загрузить вопросы теста</p>
        <button onClick={loadQuestions} className="btn btn-primary">
          Попробовать снова
        </button>
      </div>
    );
  }

  const question = questions.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="test-page">
      <div className="container">
        <div className="test-container" style={{ maxWidth: '600px', margin: '50px auto' }}>
          
          {/* Заголовок с кнопкой закрытия */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h1 className="section-title" style={{ marginBottom: 0 }}> Музыкальный тест</h1>
            <button 
              onClick={handleCancel}
              className="btn btn-outline"
              style={{ padding: '8px 16px' }}
            >
              ✕ Закрыть
            </button>
          </div>
          
          <p className="section-subtitle" style={{ marginBottom: '30px' }}>
            Ответьте на несколько вопросов, чтобы мы могли лучше понять ваш вкус
          </p>

          <div className="vinyl-card" style={{ padding: '40px' }}>
            
            {/* Прогресс */}
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: 'var(--vinyl-border)',
              borderRadius: '2px',
              marginBottom: '30px'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--vinyl-red)',
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Номер вопроса */}
            <p style={{ color: 'var(--vinyl-muted)', marginBottom: '10px' }}>
              Вопрос {currentQuestion + 1} из {questions.questions.length}
            </p>

            {/* Текст вопроса */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', lineHeight: '1.4' }}>
              {question.question}
            </h3>

            {/* Варианты ответов */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, option.value)}
                  className={`test-option ${answers[question.id] === option.value ? 'active' : ''}`}
                  style={{
                    padding: '16px 20px',
                    background: answers[question.id] === option.value ? 'var(--vinyl-red)' : 'var(--vinyl-light-bg)',
                    border: '2px solid',
                    borderColor: answers[question.id] === option.value ? 'var(--vinyl-red)' : 'var(--vinyl-border)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {option.icon && <span style={{ fontSize: '1.3rem' }}>{option.icon}</span>}
                  <span>{option.label}</span>
                  {option.color && (
                    <span style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      background: option.color,
                      borderRadius: '6px',
                      marginLeft: 'auto'
                    }} />
                  )}
                </button>
              ))}
            </div>

            {/* Кнопки навигации */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0 || submitting}
                className="btn btn-outline"
                style={{ padding: '12px 30px' }}
              >
                ← Назад
              </button>

              {currentQuestion === questions.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!answers[question.id] || submitting}
                  className="btn btn-primary"
                  style={{ padding: '12px 30px' }}
                >
                  {submitting ? 'Сохранение...' : 'Завершить тест'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!answers[question.id] || submitting}
                  className="btn btn-primary"
                  style={{ padding: '12px 30px' }}
                >
                  Далее →
                </button>
              )}
            </div>
          </div>

          {/* Прогресс-бар снизу */}
          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center',
            color: 'var(--vinyl-muted)',
            fontSize: '0.9rem'
          }}>
            Отвечено на {answeredCount} из {questions.questions.length} вопросов
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;