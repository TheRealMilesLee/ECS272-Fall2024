import { Graph1_OverallView, Graph2_DetailView, Graph3_DetailView, mountChart1, mountChart2, mountChart3 } from './src/VisualizeLayout';
import './style.css';

document.querySelector('#header').innerHTML = `
  <header class="Greeting_div fade-in">
    <p>Used Car Selector</p>
    <i>A dashboard to choose the right car for you</i>
  </header>
`;

document.querySelector('#MainBody').innerHTML = `
  <div class="grid-container">
    <div class="row1 fade-in">
      ${ Graph1_OverallView() }
    </div>
    <div class="row2-left fade-in">
      ${ Graph2_DetailView() }
    </div>
    <div class="row2-right fade-in">
      ${ Graph3_DetailView() }
    </div>
  </div>
`;

mountChart1();
mountChart2();
mountChart3();

