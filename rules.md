# SkinSolve — Rules & Engineering Guidelines

## 1. Absolute Directives
1. **Never use Streamlit**: The frontend is strictly React + Vite + TypeScript + Tailwind CSS.
2. **Never violate Hard Constraints**:
   - Total routine cost $\le$ User Budget.
   - Fragrance-free flag enforced strictly if requested.
   - Zero tolerance for excluded ingredients.
   - Zero unnecessary duplicate categories if user already has them.
3. **Deterministic & Explainable**: Every recommendation must provide exact percentage breakdown of why it was chosen.
4. **First-Class Failure States**: Never render empty generic error boxes. Calculate exact budget shortfalls or preference conflicts and propose actionable remedies.
5. **No Medical Claims**: Include cosmetic recommendation disclaimers on every UI screen.
