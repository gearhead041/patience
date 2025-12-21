import { initializeItems } from './engine';
import './style.css'

var app = document.querySelector<HTMLDivElement>('#app')!;
var { board, market, suits } = initializeItems();
console.log(board.pillars);
app.appendChild(board.div);
// app.appendChild(market.div);

//