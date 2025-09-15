// ✅ MANDATORY: File must be named data.js
// ✅ MANDATORY: Must export const appData = {}
const appData = {
    en: {
        "standard-ui": {
            // ✅ MANDATORY: Generic, reusable across all applets
            buttons: { 
                next: "Next", 
                prev: "Previous", 
                start: "Start",
                restart: "Start Over"
            },
            labels: { 
                score: "Score", 
                timer: "Time" 
            },
            instructions: {
                click_next: "Click Next",
                tap_highlighted: "Tap the highlighted area"
            }
        },
        "content-ui": {
            // ✅ MANDATORY: Applet-specific content
            headers: {
                main: "Complete the fact family using the number bond."
            },
            instructions: {
                start: "Tap the correct number in the number bond.",
                equation: "Tap the numbers in the number bond to fill the highlighted box.",
                continue: "Tap ▶ to continue"
            },
            feedback: {
                correct: "Well done! {equation} Let's try another one.",
                wrong: "Oops! This number is already in the sentence. Tap the number that is missing.",
                completion: "Great job! You completed all the fact families!",
                instruction: "Tap the numbers in the number bond to fill the highlighted box."
            },
            sections: {
                addition_facts: "Addition Facts",
                subtraction_facts: "Subtraction Facts"
            },
            problems: {
                p1: {
                    whole: 5,
                    parts: [3, 2],
                    description: "5 split into 3 + 2"
                },
                p2: {
                    whole: 6,
                    parts: [1, 5],
                    description: "6 split into 1 + 5"
                },
                p3: {
                    whole: 7,
                    parts: [4, 3],
                    description: "7 split into 4 + 3"
                }
            }
        },
        "accessibility": {
            navigationButton: "Navigation button",
            startButton: "Start button",
            numberBond: "Number bond with whole number {whole} and parts {part1} and {part2}",
            equationBox: "Equation box for {equation}",
            numberButton: "Number {number} button"
        }
    },
    es: {
        // ✅ MANDATORY: Same structure for other locales
        "standard-ui": {
            buttons: { 
                next: "Siguiente", 
                prev: "Anterior", 
                start: "Comenzar",
                restart: "Empezar de Nuevo"
            },
            labels: { 
                score: "Puntuación", 
                timer: "Tiempo" 
            },
            instructions: {
                click_next: "Haz clic en Siguiente",
                tap_highlighted: "Toca el área resaltada"
            }
        },
        "content-ui": {
            headers: {
                main: "Completa la familia de hechos usando el vínculo numérico."
            },
            instructions: {
                start: "Toca el número correcto en el vínculo numérico.",
                equation: "Toca los números en el vínculo numérico para llenar la caja resaltada.",
                continue: "Toca ▶ para continuar"
            },
            feedback: {
                correct: "¡Bien hecho! {equation} Probemos con otro.",
                wrong: "¡Ups! Este número ya está en la oración. Toca el número que falta.",
                completion: "¡Excelente trabajo! ¡Completaste todas las familias de hechos!",
                instruction: "Toca los números en el vínculo numérico para llenar la caja resaltada."
            },
            sections: {
                addition_facts: "Hechos de Suma",
                subtraction_facts: "Hechos de Resta"
            },
            problems: {
                p1: {
                    whole: 5,
                    parts: [3, 2],
                    description: "5 dividido en 3 + 2"
                },
                p2: {
                    whole: 6,
                    parts: [1, 5],
                    description: "6 dividido en 1 + 5"
                },
                p3: {
                    whole: 7,
                    parts: [4, 3],
                    description: "7 dividido en 4 + 3"
                }
            }
        },
        "accessibility": {
            navigationButton: "Botón de navegación",
            startButton: "Botón de inicio",
            numberBond: "Vínculo numérico con número completo {whole} y partes {part1} y {part2}",
            equationBox: "Caja de ecuación para {equation}",
            numberButton: "Botón de número {number}"
        }
    },
    id: {
        // ✅ MANDATORY: Same structure for Indonesian locale
        "standard-ui": {
            buttons: { 
                next: "Selanjutnya", 
                prev: "Sebelumnya", 
                start: "Mulai",
                restart: "Mulai Lagi"
            },
            labels: { 
                score: "Skor", 
                timer: "Waktu" 
            },
            instructions: {
                click_next: "Klik Selanjutnya",
                tap_highlighted: "Ketuk area yang disorot"
            }
        },
        "content-ui": {
            headers: {
                main: "Lengkapi keluarga fakta menggunakan ikatan angka."
            },
            instructions: {
                start: "Ketuk angka yang benar dalam ikatan angka.",
                equation: "Ketuk angka-angka dalam ikatan angka untuk mengisi kotak yang disorot.",
                continue: "Ketuk ▶ untuk melanjutkan"
            },
            feedback: {
                correct: "Bagus! {equation} Mari coba yang lain.",
                wrong: "Ups! Angka ini sudah ada dalam kalimat. Ketuk angka yang hilang.",
                completion: "Kerja bagus! Anda telah menyelesaikan semua keluarga fakta!",
                instruction: "Ketuk angka-angka dalam ikatan angka untuk mengisi kotak yang disorot."
            },
            sections: {
                addition_facts: "Fakta Penjumlahan",
                subtraction_facts: "Fakta Pengurangan"
            },
            problems: {
                p1: {
                    whole: 5,
                    parts: [3, 2],
                    description: "5 dibagi menjadi 3 + 2"
                },
                p2: {
                    whole: 6,
                    parts: [1, 5],
                    description: "6 dibagi menjadi 1 + 5"
                },
                p3: {
                    whole: 7,
                    parts: [4, 3],
                    description: "7 dibagi menjadi 4 + 3"
                }
            }
        },
        "accessibility": {
            navigationButton: "Tombol navigasi",
            startButton: "Tombol mulai",
            numberBond: "Ikatan angka dengan angka utuh {whole} dan bagian {part1} dan {part2}",
            equationBox: "Kotak persamaan untuk {equation}",
            numberButton: "Tombol angka {number}"
        }
    }
};

// ✅ MANDATORY: Export statement
// Make appData available globally
console.log('data.js loading, setting window.appData');
window.appData = appData;
console.log('window.appData set:', typeof window.appData);
