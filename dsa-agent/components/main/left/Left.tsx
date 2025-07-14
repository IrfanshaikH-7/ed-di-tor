'use client'
import React from 'react'
import { useQuestionsStore } from '@/store/questionsStore';

export default function Left() {
  const questions = useQuestionsStore(state => state.questions);
  return (
    <div>
      Questions count: {questions?.length}
    </div>
  )
}
