import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import '../styles/pages/Test.css'; // Импортируем стили

const Test = ({ onNavigate }) => {
  const [questions, setQuestions] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const { submitTest } = useAuth();

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
    const question = questions.questions.find(q => q.id === questionId);
    
    // Проверяем, содержит ли тип слово 'multiple' (для 'multiple' или 'image-multiple')
    const isMultiple = question.type.includes('multiple');
    
    if (isMultiple) {
      const currentAnswers = answers[questionId] || [];
      let newAnswers;
      
      if (currentAnswers.includes(value)) {
        newAnswers = currentAnswers.filter(v => v !== value);
      } else {
        if (currentAnswers.length < (question.max || 3)) {
          newAnswers = [...currentAnswers, value];
        } else {
          alert(`Можно выбрать не больше ${question.max || 3} вариантов`);
          return;
        }
      }
      
      setAnswers({
        ...answers,
        [questionId]: newAnswers
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: value
      });
    }
  };

  const handleImageError = (questionId, optionValue) => {
    setImageErrors(prev => ({
      ...prev,
      [`${questionId}-${optionValue}`]: true
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitTest(answers);
      onNavigate('profile');
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Ошибка при сохранении результатов. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Вы уверены? Весь прогресс будет потерян.')) {
      onNavigate('profile');
    }
  };

  const isCurrentQuestionAnswered = () => {
    const question = questions?.questions[currentQuestion];
    if (!question) return false;
    
    const answer = answers[question.id];
    
    // Проверяем, содержит ли тип слово 'multiple'
    const isMultiple = question.type.includes('multiple');
    
    if (isMultiple) {
      return answer && answer.length > 0;
    }
    return answer !== undefined;
  };

  if (loading) {
    return (
      <div className="test-page">
        <div className="container">
          <div className="test-loading">
            <div className="vinyl-spinner-modern"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="test-page">
        <div className="container">
          <div className="error-container">
            <h2>😕 Ой!</h2>
            <p>Не удалось загрузить вопросы теста</p>
            <button onClick={loadQuestions} className="btn btn-primary">
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="test-page">
      <div className="container">
        <div className="test-container">
          
          {/* Заголовок */}
          <div className="test-header">
            <h1 className="test-title">Музыкальный тест</h1>
            <button 
              onClick={handleCancel}
              className="test-close-btn"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          
          <p className="test-subtitle">
            Ответьте на несколько вопросов, чтобы мы могли лучше понять ваш вкус
          </p>

          {/* Прогресс */}
          <div className="test-progress-container">
            <div className="test-progress-stats">
              <span>Вопрос {currentQuestion + 1} из {questions.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="test-progress-bar">
              <div className="test-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Карточка вопроса */}
          <div className="test-question-card">
            <div className="test-question-number">
              ВОПРОС {currentQuestion + 1}
            </div>
            
            <h3 className="test-question-text">
              {question.question}
            </h3>

            {/* Варианты ответов */}
            <div 
              className="test-options-grid"
              style={{ 
                gridTemplateColumns: question.type.includes('image') 
                  ? 'repeat(auto-fit, minmax(200px, 1fr))' 
                  : '1fr'
              }}
            >
              {question.options.map((option, index) => {
                // Определяем, мультивыбор ли это
                const isMultiple = question.type.includes('multiple');
                
                const isSelected = isMultiple
                  ? answers[question.id]?.includes(option.value)
                  : answers[question.id] === option.value;
                
                const hasImageError = imageErrors[`${question.id}-${option.value}`];

                // Карточка с изображением
                if (question.type.includes('image')) {
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(question.id, option.value)}
                      className={`test-image-option ${isSelected ? 'active' : ''}`}
                    >
                      <div className="test-image-container">
                        {!hasImageError ? (
                          <img 
                            src={process.env.PUBLIC_URL + option.image}
                            alt={option.label}
                            className="test-image"
                            onError={() => handleImageError(question.id, option.value)}
                          />
                        ) : (
                          <div className="test-image-fallback">
                            {option.emoji || '🎵'}
                          </div>
                        )}
                      </div>
                      <div className="test-image-label">{option.label}</div>
                      {option.description && (
                        <div className="test-image-description">
                          {option.description}
                        </div>
                      )}
                      {/* Опционально: показать выбранные */}
                      {isMultiple && isSelected && (
                        <div className="test-selected-badge">✓</div>
                      )}
                    </button>
                  );
                }

                if (question.id === 7 && option.quote) {
                  // Специальное отображение для цитат
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(question.id, option.value)}
                      className={`test-quote-option ${isSelected ? 'active' : ''}`}
                    >
                      <div className="test-quote-container">
                        <div className="test-quote-text">"{option.quote}"</div>
                        {option.artist && (
                          <div className="test-quote-artist">— {option.artist}</div>
                        )}
                        {option.description && (
                          <div className="test-quote-description">{option.description}</div>
                        )}
                      </div>
                      {isMultiple && isSelected && (
                        <div className="test-selected-badge">✓</div>
                      )}
                    </button>
                  );
                }

                // Обычная кнопка
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className={`test-option-btn ${isSelected ? 'active' : ''}`}
                  >
                    {option.emoji && (
                      <span className="test-option-emoji">{option.emoji}</span>
                    )}
                    <span className="test-option-label">{option.label}</span>
                    {option.color && (
                      <span 
                        className="test-option-color"
                        style={{ 
                          background: option.color,
                          border: option.color === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none'
                        }}
                      />
                    )}
                    {option.description && (
                      <span className="test-option-description">{option.description}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Навигация */}
            <div className="test-navigation">
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0 || submitting}
                className="test-nav-btn prev"
              >
                ← Назад
              </button>

              {currentQuestion === questions.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isCurrentQuestionAnswered() || submitting}
                  className="test-nav-btn submit"
                >
                  {submitting ? 'Сохранение...' : 'Завершить тест'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!isCurrentQuestionAnswered() || submitting}
                  className="test-nav-btn next"
                >
                  Далее →
                </button>
              )}
            </div>
          </div>

          {/* Счётчик */}
          <div className="test-counter">
            Отвечено на {answeredCount} из {questions.questions.length} вопросов
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;