import JK4Image from "./pictureSolutions/JK4.png";
import JA1Image from "./pictureSolutions/JA1.png";
import JA2Image from "./pictureSolutions/JA2.png";
import JC1Image from "./pictureSolutions/JC1.png";
import JC2Image from "./pictureSolutions/JC2.png";
import JT1Image from "./pictureSolutions/JT1.png";
import JT2Image from "./pictureSolutions/JT2.png";

import MA1Image from "./pictureSolutions/MA1.png";
import MA2Image from "./pictureSolutions/MA2.png";
// import MA3Image from "./pictureSolutions/MA3.png"; // WIP
import MT1Image from "./pictureSolutions/MT1.png";
// import MT2Image from "./pictureSolutions/MT2.png"; // WIP

import RK3Image from "./pictureSolutions/RK3.png";
import RA1Image from "./pictureSolutions/RA1.png";
import RA2Image from "./pictureSolutions/RA2.png";
import RA3Image from "./pictureSolutions/RA3.png";
import RT2Image from "./pictureSolutions/RT2.png";

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

    "MK1": {
        question: "What is the degree of the polynomial $f(x) = (x-2)^3(x^7 - x^4)^5 + (x-2)(x^2 + 5)^2$?",
        category: "Knowledge",
        options: ["35", "36", "38", "40"],
        correct: 2,
        type: "mc",
        solution: "The highest degree term comes from the first term, $x^3 * (x^7)^5 = x^{3+7*5} = x^{38}$, so the degree is 38.",
    },

    "MK2": {
        question: "Is the polynomial even, odd, or neither? $f(x) = 7^0 - 6^4 + (4x^2)(x^2 - 5) + 20x^2$. Make sure to prove it!",
        category: "Knowledge",
        correct: "248",
        type: "short",
        solution: "All terms contain even powers of $x$ or are constants. You can also prove algebraically. Since $f(-x) = f(x)$, the function is even.",
    },

    "MK3": {
        question: "What is the maximum number of $x$-intercepts and turning points for a polynomial of degree 67?",
        category: "Knowledge",
        options: [
            "67 x-intercepts and 67 turning points",
            "66 x-intercepts and 67 turning points",
            "67 x-intercepts and 66 turning points",
            "66 x-intercepts and 66 turning points"
        ],
        correct: 2,
        type: "mc",
        solution: "A polynomial of degree $n$ can have at most $n$ x-intercepts and $n-1$ turning points.",
    },

    "MK4": {
        question: "What is the end behavior of the polynomial $f(x) = (x-5)^2(x+4)(x^2 - 2)$?",
        category: "Knowledge",
        options: [
            "As $x \\to -\\infty$, $f(x) \\to -\\infty$ and as $x \\to \\infty$, $f(x) \\to -\\infty$",
            "As $x \\to -\\infty$, $f(x) \\to \\infty$ and as $x \\to \\infty$, $f(x) \\to \\infty$",
            "As $x \\to -\\infty$, $f(x) \\to -\\infty$ and as $x \\to \\infty$, $f(x) \\to \\infty$",
            "As $x \\to -\\infty$, $f(x) \\to \\infty$ and as $x \\to \\infty$, $f(x) \\to -\\infty$"
        ],
        correct: 2,
        type: "mc",
        solution: "This is because the polynomial has odd degree with a positive leading coefficient.",
    },

    "MK5": {
        question: "Given the equation $f(x) = (x^2 + 5x + 6)(x^2 - 2)^2 (x + \\frac{5}{2})^3$, which option correctly states the zeros of the function and the behavior at each zero?",
        category: "Knowledge",
        options: [
            "Zeros: $-3, -\\frac{5}{2}, -2, \\pm\\sqrt{2}$; all pass through",
            "Zeros: $-3, -\\frac{5}{2}, -2, \\pm\\sqrt{2}$; $-3$ and $-2$ pass through, $\\pm\\sqrt{2}$ bounce, $-\\frac{5}{2}$ is a point of inflection",
            "Zeros: $-3, -2, \\pm\\sqrt{2}$; $\\pm\\sqrt{2}$ bounce, others pass through",
            "Zeros: $-3, -\\frac{5}{2}, -2$; $-\\frac{5}{2}$ is a point of inflection"
        ],
        correct: 1,
        type: "mc",
        solution: "Zeros (order 1) pass straight through, zeros with even multiplicity bounce, and the zeros with even order (but not order 1) passes through and change concavity (POI).",
    },

    "MA1": {
        question: "Given $f(x)$, create a fully simplified equation $h(x)$ if the following transformations are applied in order: reflection over the $y$-axis, horizontal stretch by a factor of 2, vertical stretch by a factor of 2, then a horizontal shift left by 5.",
        category: "Application",
        correct: "804",
        type: "code",
        solution: MA1Image,
    },

    "MA2": {
        question: "Determine the equation of an eighth-degree polynomial in factored form that passes through the point $(1, -540)$. It passes straight through $(-5, 0)$, bounces at $(\\frac{3}{2}, 0)$ and $(4, 0)$, and has a point of inflection at $(3, 0)$.",
        category: "Application",
        correct: "739",
        type: "code",
        solution: MA2Image,
    },

    "MA3": {
        question: "Given the following points, determine the polynomial equation that models the data:\n\nx | y\n-1 | 17\n0  | 13\n1  | 15\n2  | 47\n3  | 133\n4  | 297\n5  | 563",
        category: "Application",
        correct: "9064",
        type: "code",
        solution: "Third differences are constant and non-zero, so the degree of the polynomial is 3. The answer is $f(x) = 4x^3 + 3x^2 - 5x + 13$.",
    },

    "MC1": {
        question: "Why do all polynomials have a domain of all real numbers? Explain using algebraic solutions, and/or graphing.",
        category: "Communication",
        correct: "428",
        type: "code",
        solution: "All polynomials have a domain of all real numbers, due to the lack of holes, roots, logs, or any other factors that will impact their domain. Since a polynomial is defined as having powers of $x$ which are whole numbers, otherwise defined as greater than or equal to 0, all $x$ values will have real outputs.",
    },

    "MC2": {
        question: "Explain the relationship between degree $n$ and the maximum number of $x$-intercepts and turning points. Include a detailed algebraic and/or graphical proof, and identify any exceptions to these rules.",
        category: "Communication",
        correct: "9371",
        type: "code",
        solution: "$n$ is equal to the maximum number of $x$-intercepts, while $n - 1$ is equal to the maximum number of turning points. This relation can be seen when starting to graph simple polynomials. The x-intercepts work, as there can be no more than $n$. For example, a degree 5 polynomial in factored form could be $x^5 = (x)(x)(x)(x)(x)$. No more x terms than this can exist for a degree of 5. For turning points, the maximum is $n-1$. The exception to the x-intercept rule is $y = 0$, a constant polynomial, which has an infinite number of x-intercepts. Mathematicians define its degree as undefined.",
    },

    "MT1": {
        question: "A polynomial function with a degree of 7 has 5 distinct zeroes, and 4 turning points. If the function passes through the origin, it has a negative leading coefficient. Determine all possible combinations of multiplicities of the $x$-intercepts with a degree of 7 and 5 distinct zeroes, and which combination(s) would actually produce 4 turning points.",
        category: "Thinking",
        correct: "3167",
        type: "code",
        solution: MT1Image,
    },

    "MT2": {
        question: "A polynomial function $f(x)$ with a degree of 5 passes through the points $(-3, 0)$, $(2, 0)$, $(4, 0)$, $(0, 48)$. The graph has a horizontal tangent line (slope = 0) at $x = 2$. Determine the possible equation(s) of $f(x)$.",
        category: "Thinking",
        correct: "9042",
        type: "code",
        solution: "There are 2 possibilities:\n$f(x) = \\frac{1}{4}(x+3)(x-2)^2(x-4)^2$\n$f(x) = -\\frac{1}{3}(x+3)^2(x-2)^2(x-4)$",
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

    "RK3": {
        question: "Using an even/odd function check, determine if the function $f(x) = 3x^4 + x^2 + 1$ is odd, even, or neither.",
        category: "Knowledge",
        correct: "371",
        type: "code",
        solution: RK3Image,
    },

    "RK4": {
        question: "Determine the end behaviour for the function $f(x) = \\cos x$.",
        category: "Knowledge",
        options: [
            "As $x \\to -\\infty$ and $x \\to \\infty$, $f(x) \\to \\infty$",
            "As $x \\to -\\infty$ and $x \\to \\infty$, $f(x) \\to 0$",
            "As $x \\to -\\infty$ and $x \\to \\infty$, $f(x) \\to 1$",
            "No end behaviour, since $\\cos x$ oscillates indefinitely"
        ],
        correct: 3,
        type: "mc",
        solution: "No end behaviour, since $\\cos x$ oscillates between $-1$ and $1$ indefinitely.",
    },

    "RK5": {
        question: "For the equation $y = 2x + 9x^4 - 7x^5 + 8x^{15} + x^{19} - 278$, which finite differences will be constant?",
        category: "Knowledge",
        options: [
            "A) 4th difference",
            "B) 15th difference",
            "C) 21st difference",
            "D) 19th difference"
        ],
        correct: 3,
        type: "mc",
        solution: "19th difference is constant because the order of the polynomial is 19. 4th and 15th differences are not constant since they are lower than the degree. 21st difference does not exist because it is higher than the degree.",
    },

    "RA1": {
        question: "For a polynomial that has roots at $x=3$ (order 1), $x=5$ (order 1), and $x=-3$ (order 2), determine the leading coefficient if the polynomial passes through the point $(4, -98)$.",
        category: "Application",
        correct: "311",
        type: "code",
        solution: RA1Image,
    },

    "RA2": {
        question: "Graph the polynomial function $f(x) = \\frac{1}{2} (x-3)(x+2)(x-1)^2$.",
        category: "Application",
        correct: "820",
        type: "code",
        solution: RA2Image,
    },

    "RA3": {
        question: "Given the following points, determine the polynomial equation that models the data:\n\nx | y\n-3 | -4\n-2 | 4\n-1 | 0\n0  | -4\n1  | 4\n2  | 36\n3  | 104",
        category: "Application",
        correct: "904",
        type: "code",
        solution: RA3Image,
    },

    "RC1": {
        question: "Explain why an odd-degree function always ends in diagonal quadrants (i.e. Q1 to Q3, Q2 to Q4).",
        category: "Communication",
        correct: "519",
        type: "code",
        solution: "When the x-value is negative, the odd degree will result in the first term being negative. Even if the leading coefficient is negative, the function is only reflected over the x-axis, thus maintaining the diagonal quadrant relation. Example: $x^3$ is in quadrants 1 and 3, since any negative x-value results in a negative value of $x^3$.",
    },

    "RC2": {
        question: "Explain why expressions such as $\\cos x$, $\\sin x$, and $\\tan x$ are not considered polynomial terms.",
        category: "Communication",
        correct: "820",
        type: "code",
        solution: "They are all trigonometric functions. They do not have degrees of 1 or higher.",
    },

    "RT1": {
        question: "Given the following equation, $f(x) = x(x^A + Bx + C)(x-3)^2$, determine the values of $B$ and $C$ that would make this function odd with an order of 5 and a leading coefficient of 1.",
        category: "Thinking",
        correct: "337",
        type: "code",
        solution: "Since there is an x-intercept at $x = 0$ and $x = 3$ of order 2, the remaining x-intercept must be $x = -3$. Since the total order is 5, $A$ must equal 2. The x-intercept of $x = -3$ has degree 2 and the LC is 1, so it can be written as $(x+3)^2 = x^2 + 6x + 9$. From the rewritten expression, $B = 6$ and $C = 9$.",
    },

    "RT2": {
        question: "Given the following equation, determine if it is odd, even, or neither without substituting a value for $x$:\n$f(x) = 0.5 |x^3| (8x)^2 + 98x$",
        category: "Thinking",
        correct: "127",
        type: "code",
        solution: RT2Image,
    },
};
