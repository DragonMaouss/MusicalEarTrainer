export type ExerciseType = 'intervals' | 'chords'

export type SessionResult = {
    id : string
    date: string
    exerciseType: ExerciseType
    score: number
    totalQuestions: number
}