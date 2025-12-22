import { initializeItems } from './engine';
import './style.css'

var app = document.querySelector<HTMLDivElement>('#app')!;
var { board, market, suits } = initializeItems();
var top = document.createElement("div");
top.classList.add("top");
top.appendChild(market.div);

app.appendChild(top);
app.appendChild(board.div);
// app.appendChild(market.div);

//