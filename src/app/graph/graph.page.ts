import { GraphService } from '@service/graph.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.page.html',
  styleUrls: ['./graph.page.scss'],
})
export class GraphPage implements OnInit {
  constructor(private graphService: GraphService) {}

  ngOnInit() {}
}
