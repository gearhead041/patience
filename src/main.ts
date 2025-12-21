import { initializeItems } from './engine';
import './style.css'

var app = document.querySelector<HTMLDivElement>('#app')!;
var { board, market, suits } = initializeItems();
app.appendChild(board.div);
// app.appendChild(market.div);

//