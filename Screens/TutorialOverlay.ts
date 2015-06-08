import View = require('../lib/View');
let Component = View.Component;

import Button = require('./components/Button');


export function create(handlers: {
    closeTutorial: () => void;
}) {
    let mainComponent = Component<void, void>(
        function mainView(initialBindings) {
            let element = document.createElement('div');
            element.classList.add('overlay');
            element.classList.add('tutorial');

            let title = document.createElement('h1');
            title.textContent = 'How to play';
            element.appendChild(title);

            let explanationBodyText = document.createElement('p');
            explanationBodyText.textContent = [
                'Hit the correct direction to get points. The arrow points towards the current direction',
                'to hit. Hitting the wrong direction will lose you points and cost you a life. Lose too',
                'many lives and you will lose the game.'
                ].join(' ');

            element.appendChild(explanationBodyText);

            let touchControlsExplanation = document.createElement('div');

            let touchControlsExplanationText = document.createElement('p');
            touchControlsExplanationText.textContent = 'Hit the sides of the screen.';
            touchControlsExplanation.appendChild(touchControlsExplanationText);

            let touchControlsPicture = document.createElement('div');
            touchControlsPicture.classList.add('touch-controls-picture');
            touchControlsPicture.innerHTML = `
                <table>
                    <tr>
                        <td></td>
                        <td class="outlined">&uarr;</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="outlined">&larr;</td>
                        <td></td>
                        <td class="outlined">&rarr;</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td class="outlined">&darr;</td>
                        <td></td>
                   </tr>
               </table>
            `;
            touchControlsExplanation.appendChild(touchControlsPicture);

            element.appendChild(touchControlsExplanation);

            let literallyJustTheWordOr = document.createElement('p');
            literallyJustTheWordOr.textContent = 'Or:';
            literallyJustTheWordOr.classList.add('just-the-word-or');

            element.appendChild(literallyJustTheWordOr);

            let keyboardControlsExplanation = document.createElement('div');

            let keyboardControlsExplanationText = document.createElement('p');
            keyboardControlsExplanationText.textContent = 'Press the arrow keys.';
            keyboardControlsExplanation.appendChild(keyboardControlsExplanationText);

            let keyboardControlsPicture = document.createElement('div');
            keyboardControlsPicture.innerHTML = `
                <table>
                    <tr>
                        <td></td>
                        <td class="outlined">&uarr;</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="outlined">&larr;</td>
                        <td class="outlined">&darr;</td>
                        <td class="outlined">&rarr;</td>
                    </tr>

               </table>
            `;
            keyboardControlsExplanation.appendChild(keyboardControlsPicture);

            element.appendChild(keyboardControlsExplanation);

            return {
                element,
                methods: null
            };
        },
        function mainController(methods, services){

        },
        function initialBindings(services) {

        }
    )(null);

    return mainComponent(
        Button({
            label: 'Play'
        }, {
            click: handlers.closeTutorial
        })()
    );
}

