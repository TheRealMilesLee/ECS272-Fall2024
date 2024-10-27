import { Graph1_OverallView, Graph2_DetailView, Graph3_DetailView, mountChart1, mountChart2, mountChart3 } from './src/VisualizeLayout';
import './style.css';

document.querySelector('#header').innerHTML = `
  <header class="Greeting_div fade-in">
    <h5>Car Sales Trend - The ultimate guide to buy a car</h5>
    <h6>By Hengyi Li</h6>
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

document.querySelector('#footer').innerHTML = `
  <footer class="footer fade-in">
    <div class="container">
      <div class="row">
        <div class="col l6 s12">
          <h5>ECS272 Information Visualization</h5>
          <p>The ultimate guide to buy a car</p>
          <br>
          <p> &copy; 2024 Hengyi Li. All rights reserved </p>
        </div>
        <div class="col l4 offset-l2 s12">
          <h5>Connect with me</h5>
          <ul>
            <li><a class="black-text"
                 href="https://github.com/TheRealMilesLee"
                 target="_blank">GitHub</a></li>
            <li><a class="black-text"
                 href="https://www.linkedin.com/in/hengyi-li-968744191/?locale=en_US"
                 target="_blank">LinkedIn</a></li>
          </ul>
        </div>
      </div>
    </div>
    </footer>
`;

mountChart1();
mountChart2();
mountChart3();

