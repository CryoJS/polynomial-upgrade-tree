import JK4Image from "./pictureSolutions/JK4.png";
import JA1Image from "./pictureSolutions/JA1.png";
import JA2Image from "./pictureSolutions/JA2.png";
import JC1Image from "./pictureSolutions/JC1.png";
import JC2Image from "./pictureSolutions/JC2.png";
import JT1Image from "./pictureSolutions/JT1.png";
import JT2Image from "./pictureSolutions/JT2.png";

// Question ID Format: Author -> Category -> Question #
export const questionData = {
    "JK1": {
        question: "The degree of a polynomial function must belong to what type of numbers?",
        category: "Knowledge",
        options: ["Natural numbers (ℕ)", "Whole numbers (𝕎)", "Integers (ℤ)", "Rational numbers (ℚ)"],
        correct: 1,
        type: "mc",
        solution: "The degree of a polynomial is the highest power of the variable with a non-zero coefficient. Since exponents in polynomials must be whole numbers, the degree belongs to 𝕎.",
    },

    "JK2": {
        question: "State the degree of the polynomial $f(x) = 3x - 2 + x^4 - 10x^2$.",
        category: "Knowledge",
        options: ["1", "2", "3", "4"],
        correct: 3,
        type: "mc",
        solution: "The degree of a polynomial is the highest degree of all the terms (the exponent of $x$). Here, $x^4$ is the term with the highest degree of 4, so the polynomial has a degree of 4.",
    },

    "JK3": {
        question: "What is the possible number of turning points for a degree-6 polynomial?",
        category: "Knowledge",
        options: ["0, 2, 4, 6", "1, 2, 3, 4, 5", "1, 3, 5", "2, 4, 6"],
        correct: 2,
        type: "mc",
        solution: "A degree-$n$ polynomial can have at most $n-1$ turning points. Since the degree is even (6), the graph has the same end behaviour on both sides, so it must have an odd number of turning points. Therefore, the possible number of turning points is 1, 3, or 5.",
    },

    "JK4": {
        question: "How many turning points does the following function have?\n$f(x)=-3(x-4)^2(x+1)^3(x-6)(x+2)^8(x-5)(x-2)^7(x-1)$",
        category: "Knowledge",
        options: ["7", "8", "9", "10"],
        correct: 1,
        type: "mc",
        solution: JK4Image,
    },

    "JK5": {
        question: "What is the end behaviour of $f(x)=-2x^3+5x-1$?",
        category: "Knowledge",
        options: [
            "As $x \\to -\\infty$, $f(x) \\to -\\infty$.\nAs $x \\to \\infty$, $f(x) \\to \\infty$.",
            "As $x \\to -\\infty$, $f(x) \\to \\infty$.\nAs $x \\to \\infty$, $f(x) \\to -\\infty$.",
            "As $x \\to -\\infty$, $f(x) \\to \\infty$.\nAs $x \\to \\infty$, $f(x) \\to \\infty$.",
            "As $x \\to -\\infty$, $f(x) \\to -\\infty$.\nAs $x \\to \\infty$, $f(x) \\to -\\infty$."
        ],
        correct: 1,
        type: "mc",
        solution: "This is because the degree is odd ($n=3$) and the leading coefficient is negative, so the graph has an end behaviour of Q2 → Q4.",
    },

    "JK6": {
        question: "Which option is a polynomial function?",
        category: "Knowledge",
        options: [
            "a) $f(x)=\\sqrt{x}+5$",
            "b) $f(x)=\\frac{3}{x}-1$",
            "c) $f(x)=\\pi$",
            "d) $f(x)=\\sin(x)$"
        ],
        correct: 2,
        type: "mc",
        solution: "Option a) has a square root, which is a fractional exponent. Option b) has a variable in the denominator, which is a negative exponent. Option d) is a trigonometric function, not a polynomial. Only option c) satisfies all the conditions of a polynomial. Remember that polynomials must have a degree in 𝕎 (whole numbers, including 0), and the degree of each term must be a whole number.",
    },

    "JA1": {
        question: "Determine the exact equation in factored form for a fifth-degree polynomial function that passes through the points: $\\{(0, -20), (-2, 0), (1, 0), (5, 0)\\}$, where it touches and bounces off the x-axis at $x=1,5$.",
        category: "Application",
        correct: "123",
        type: "code",
        solution: JA1Image
    },

    "JA2": {
        question: "Sketch the graph of the function $f(x)=-2(x-3)^2(x+1)$ by filling out key properties: degree, sign of the leading coefficient, x-intercepts, and y-intercept.",
        category: "Application",
        correct: "314",
        type: "code",
        solution: JA2Image
    },

    "JC1": {
        question: "Is the function $f(x)=2(x-5)^2(x+5)^2(x-2)(x+2)$ even, odd, or neither? Explain both graphically and algebraically.",
        category: "Communication",
        correct: "217",
        type: "code",
        solution: JC1Image
    },

    "JC2": {
        question: "Explain why a sixth-degree polynomial function with 3 x-intercepts, with one x-intercept being a point of inflection, must have an x-intercept that is of order 2.",
        category: "Communication",
        correct: "67",
        type: "code",
        solution: JC2Image
    },

    "JT1": {
        question: "Algebraically find and state the transformations that are applied to $f(x)=x^5-x^3+1$ to obtain $g(x)=160(x-3)^5-40(x-3)^3+2$, if you already know two of the transformations: the function is reflected on the x-axis and vertically stretched by a factor of 5.",
        category: "Thinking",
        correct: "999",
        type: "code",
        solution: JT1Image
    },

    "JT2": {
        question: "Given the function $f(x)=-4(x+9)^2(x-15)(2x+6)^3$, determine if the function is even, odd, or neither, if it is reflected over the y-axis and horizontally stretched by a factor of $\\frac{1}{3}$.",
        category: "Thinking",
        correct: "76",
        type: "code",
        solution: JT2Image
    },

    "RK1": {
        question: "True or false: $y = 8\\sqrt{8x+9}$ is a polynomial.",
        category: "Knowledge",
        options: ["True", "False"],
        correct: 1,
        type: "mc",
        solution: "The equation can be written as $y = 8(8x+9)^\\frac{1}{2}$, and since a variable in a polynomial can not have a fractional exponent, the equation is not a polynomial.",
    },

    "RK2": {
        question: "What is the domain and range of the function $f(x) = x^2 + 4x + 3$?",
        category: "Knowledge",
        options: [
            "D: $(-\\infty, \\infty)$, R: $[-1, \\infty)$",
            "D: $(-\\infty, \\infty)$, R: $[-2, \\infty)$",
            "D: $[-2, \\infty)$, R: $(-\\infty, \\infty)$",
            "D: $[0, \\infty)$, R: $[3, \\infty)$"
        ],
        correct: 0,
        type: "mc",
        solution: "Domain:\nAny values of $x$ are valid inputs to the function, so D: $(-\\infty, \\infty)$." +
            "\n\nRange:\nAfter factoring the function into $f(x) = (x+3)(x+1)$, the equation of the axis of symmetry is $x = \\frac{-3 + (-1)}{2} = -2$, and $f(-2) = -1$." +
            "\nTherefore, the minimum point is at $(-2, -1)$, and we know it's a minimum because the function opens upward (the leading coefficient is positive). Thus, R: $[-1, \\infty)$.",
    },
};
